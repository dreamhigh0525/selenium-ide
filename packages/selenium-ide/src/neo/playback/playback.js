// Licensed to the Software Freedom Conservancy (SFC) under one
// or more contributor license agreements.  See the NOTICE file
// distributed with this work for additional information
// regarding copyright ownership.  The SFC licenses this file
// to you under the Apache License, Version 2.0 (the
// "License"); you may not use this file except in compliance
// with the License.  You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.

import EventEmitter from 'events'
import { createPlaybackTree } from './playback-tree'
import { mergeEventEmitter } from '../../common/events'
import { AssertionError, VerificationError } from './errors'

const EE = Symbol('event-emitter')
const state = Symbol('state')
const DELAY_INTERVAL = 10

export default class Playback {
  constructor({ executor, testId, baseUrl, variables, options }) {
    this.executor = executor
    this.testId = testId
    this.baseUrl = baseUrl
    this.variables = variables
    this.options = Object.assign(
      {
        pauseOnExceptions: false,
        delay: 0,
      },
      options
    )
    this[EE] = new EventEmitter()
    this[state] = {}
    mergeEventEmitter(this, this[EE])
  }

  async init() {
    await this._prepareToPlay()
    this[state].initialized = true
  }

  async play(commands) {
    this.playbackTree = createPlaybackTree(commands)
    this.currentExecutingNode = this.playbackTree.startingCommandNode
    if (!this[state].initialized) await this.init()
    await this._play()
  }

  async playSingleCommand(command) {
    this.playbackTree = createPlaybackTree([command])
    this.currentExecutingNode = this.playbackTree.startingCommandNode
    if (!this[state].initialized) await this.init()
    await this._play()
  }

  async pause({ graceful } = { graceful: false }) {
    this[state].pausing = true
    if (!graceful) {
      await this.executor.cancel()
    }
    await new Promise(res => {
      this[state].pausingResolve = res
    })
  }

  resume() {
    if (this[state].resumeResolve) {
      const r = this[state].resumeResolve
      this[state].resumeResolve = undefined
      r()
      this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
        state: PlaybackStates.PLAYING,
      })
    }
  }

  async stop() {
    this._setExitCondition(PlaybackStates.STOPPED)
    this[state].stopping = true

    if (this[state].resumeResolve) {
      const r = this[state].resumeResolve
      this[state].resumeResolve = undefined
      r()
    } else {
      await this.executor.cancel()
    }

    // play will throw but the user will catch it with this.play()
    // this.stop() should resolve once play finishes
    await this[state].playPromise.catch(() => {})
  }

  async abort() {
    this._setExitCondition(PlaybackStates.ABORTED)
    this[state].aborting = true

    if (this[state].resumeResolve) {
      const r = this[state].resumeResolve
      this[state].resumeResolve = undefined
      r()
    }
    // we kill regardless of wether the test is paused to keep the
    // behavior consistent

    await this.executor.kill()

    // play will throw but the user will catch it with this.play()
    // this.abort() should resolve once play finishes
    await this[state].playPromise.catch(() => {})
  }

  async cleanup() {
    await this.executor.cleanup()
  }

  async _prepareToPlay() {
    this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
      state: PlaybackStates.PREPARATION,
    })
    await this.executor.init({
      baseUrl: this.baseUrl,
      variables: this.variables,
    })
  }

  async _play() {
    this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
      state: PlaybackStates.PLAYING,
    })
    this[state] = {
      initialized: true,
      playPromise: (async () => {
        try {
          await this._executionLoop()
        } catch (err) {
          throw err
        } finally {
          await this._finishPlaying()
        }
      })(),
    }

    await this[state].playPromise
  }

  async _executionLoop({ ignoreBreakpoint } = {}) {
    if (this[state].stopping) {
      return
    } else if (this[state].pausing) {
      await this._pause()
      return await this._executionLoop({ ignoreBreakpoint: true })
    } else if (this.currentExecutingNode) {
      if (this.currentExecutingNode.command.isBreakpoint && !ignoreBreakpoint) {
        await this._break()
        return await this._executionLoop({ ignoreBreakpoint: true })
      }
      const command = this.currentExecutingNode.command
      this[EE].emit(PlaybackEvents.COMMAND_STATE_CHANGED, {
        id: command.id,
        callstackIndex: undefined,
        state: CommandStates.EXECUTING,
        message: undefined,
      })

      try {
        await this._delay()
      } catch (err) {
        if (this[state].stopping) {
          return
        } else if (this[state].pausing) {
          await this._pause()
          return await this._executionLoop({ ignoreBreakpoint: true })
        }
      }

      let result
      try {
        result = await this._executeCommand(this.currentExecutingNode)
      } catch (err) {
        if (err instanceof AssertionError) {
          this[EE].emit(PlaybackEvents.COMMAND_STATE_CHANGED, {
            id: command.id,
            callstackIndex: undefined,
            state: CommandStates.FAILED,
            message: err.message,
          })
          return await this._handleException(() => {
            this._setExitCondition(PlaybackStates.FAILED)
            throw err
          })
        } else if (err instanceof VerificationError) {
          this[EE].emit(PlaybackEvents.COMMAND_STATE_CHANGED, {
            id: command.id,
            callstackIndex: undefined,
            state: CommandStates.FAILED,
            message: err.message,
          })
          return await this._handleException(async () => {
            this._setExitCondition(PlaybackStates.FAILED)
            // focibly continuing verify commands
            this.currentExecutingNode = this.currentExecutingNode.next
            return await this._executionLoop()
          })
        } else {
          this[EE].emit(PlaybackEvents.COMMAND_STATE_CHANGED, {
            id: command.id,
            callstackIndex: undefined,
            state: CommandStates.ERRORED,
            message: err.message,
          })
          return await this._handleException(() => {
            this._setExitCondition(PlaybackStates.ERRORED)
            throw err
          })
        }
      }
      this[EE].emit(PlaybackEvents.COMMAND_STATE_CHANGED, {
        id: command.id,
        callstackIndex: undefined,
        state: CommandStates.PASSED,
        message: undefined,
      })
      this.currentExecutingNode = result.next

      return await this._executionLoop()
    }
  }

  async _executeCommand(commandNode) {
    const result = await commandNode.execute(this.executor)

    return result
  }

  async _finishPlaying() {
    this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
      state: this[state].exitCondition || PlaybackStates.FINISHED,
    })
  }

  async _pause() {
    this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
      state: PlaybackStates.PAUSED,
    })
    await this.__pause()
  }

  async _break() {
    this[EE].emit(PlaybackEvents.PLAYBACK_STATE_CHANGED, {
      state: PlaybackStates.BREAKPOINT,
    })
    await this.__pause()
  }

  async __pause() {
    // internal method to handle either breaking or pausing
    this[state].pausing = false
    if (this[state].pausingResolve) {
      const r = this[state].pausingResolve
      this[state].pausingResolve = undefined
      r()
    }

    await new Promise(res => {
      this[state].resumeResolve = res
    })
  }

  async _handleException(unhandledBahaviorFn) {
    if (!this.options.pauseOnExceptions) {
      return await unhandledBahaviorFn()
    } else {
      await this._break()
      return await this._executionLoop({ ignoreBreakpoint: true })
    }
  }

  async _delay() {
    if (this.options.delay)
      return new Promise((res, rej) => {
        const start = new Date()
        const interval = setInterval(() => {
          if (
            this[state].pausing ||
            this[state].stopping ||
            this[state].aborting
          ) {
            rej(
              new Error('delay cancelled due to playback being stopped/paused')
            )
            clearInterval(interval)
          } else if (new Date() - start > this.options.delay) {
            res()
            clearInterval(interval)
          }
        }, DELAY_INTERVAL)
      })
  }

  _setExitCondition(condition) {
    if (!this[state].exitCondition) {
      this[state].exitCondition = condition
    } else if (
      PlaybackStatesPriorities[condition] >
      PlaybackStatesPriorities[this[state].exitCondition]
    ) {
      this[state].exitCondition = condition
    }
  }
}

export const PlaybackEvents = {
  COMMAND_STATE_CHANGED: 'command-state-changed',
  PLAYBACK_STATE_CHANGED: 'playback-state-changed',
}

export const PlaybackStates = {
  PREPARATION: 'prep',
  PLAYING: 'playing',
  FINISHED: 'finished',
  FAILED: 'failed',
  ERRORED: 'errored',
  PAUSED: 'paused',
  BREAKPOINT: 'breakpoint',
  STOPPED: 'stopped',
  ABORTED: 'aborted',
}

const PlaybackStatesPriorities = {
  [PlaybackStates.FINISHED]: 0,
  [PlaybackStates.FAILED]: 1,
  [PlaybackStates.ERRORED]: 2,
  [PlaybackStates.STOPPED]: 3,
  [PlaybackStates.ABORTED]: 4,
}

export const CommandStates = {
  EXECUTING: 'executing',
  PENDING: 'pending',
  PASSED: 'passed',
  UNDETERMINED: 'undetermined',
  FAILED: 'failed',
  ERRORED: 'errored',
}
