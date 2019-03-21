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

import { ControlFlowCommandNames } from '../../src/playback-tree/commands'
import { CommandNode } from '../../src/playback-tree/command-node'
import Variables from '../util/Variables'

describe('Command Node', () => {
  it('control flow check returns correct result', () => {
    let node = new CommandNode(undefined)
    node.right = 'asdf'
    expect(node.isControlFlow()).toBeTruthy()
    node.left = undefined
    node.right = 'asdf'
    expect(node.isControlFlow()).toBeTruthy()
  })
  it('retry limit defaults to 1000', () => {
    const command = {
      command: ControlFlowCommandNames.times,
      target: '',
      value: '',
    }
    const node = new CommandNode(command)
    node.timesVisited = 999
    expect(node._isRetryLimit()).toBeFalsy()
    node.timesVisited = 1000
    expect(node._isRetryLimit()).toBeTruthy()
  })
  it('retry limit can be overriden', () => {
    const command = {
      command: ControlFlowCommandNames.repeatIf,
      target: '',
      value: 5,
    }
    const node = new CommandNode(command)
    node.timesVisited = 5
    expect(node._isRetryLimit()).toBeTruthy()
  })
  it('execute resolves with an error message when too many retries attempted in a loop', () => {
    const command = {
      command: ControlFlowCommandNames.while,
      target: '',
      value: 2,
    }
    const node = new CommandNode(command)
    node.timesVisited = 3
    return node.execute().catch(err => {
      expect(err.message).toEqual(
        'Max retry limit exceeded. To override it, specify a new limit in the value input field.'
      )
    })
  })
  it("evaluate resolves with an error message on 'times' when an invalid number is provided", () => {
    const command = {
      command: ControlFlowCommandNames.times,
      target: 'asdf',
      value: '',
    }
    const node = new CommandNode(command)
    return node._evaluate({ variables: new Variables() }).catch(err => {
      expect(err.message).toEqual('Invalid number provided as a target.')
    })
  })
  it('timesVisited only incremenrts for control flow commands', () => {
    let command = {
      command: ControlFlowCommandNames.times,
      target: '',
      value: '',
    }
    let node = new CommandNode(command)
    expect(node.timesVisited).toBe(0)
    node._incrementTimesVisited()
    expect(node.timesVisited).toBe(1)
    command = {
      command: 'command',
      target: '',
      value: '',
    }
    node = new CommandNode(command)
    expect(node.timesVisited).toBe(0)
    node._incrementTimesVisited()
    expect(node.timesVisited).toBe(0)
  })
  it("evaluationResult returns the 'right' node on true", () => {
    const command = {
      command: 'a',
      target: '',
      value: '',
    }
    const node = new CommandNode(command)
    node.right = 'b'
    node.left = 'c'
    const result = node._evaluationResult({ result: 'success', value: true })
    expect(result.next).toEqual('b')
  })
  it("evaluationResult returns the 'left' node on false", () => {
    const command = {
      command: 'a',
      target: '',
      value: '',
    }
    const node = new CommandNode(command)
    node.right = 'b'
    node.left = 'c'
    const result = node._evaluationResult({ result: 'success', value: false })
    expect(result.next).toEqual('c')
  })
  it("executionResult returns the 'next' node on non-controlflow commands", () => {
    const command = {
      command: 'open',
      target: '',
      value: '',
    }
    let nodeA = new CommandNode(command)
    const nodeB = new CommandNode(command)
    nodeA.next = nodeB
    expect(nodeA._executionResult().next).toEqual(nodeB)
  })
  it("executionResult returns a 'next' node on control flow", () => {
    const command = {
      command: ControlFlowCommandNames.if,
      target: '',
      value: '',
    }
    let nodeA = new CommandNode(command)
    nodeA.left = 'asdf'
    const nodeB = new CommandNode(command)
    expect(
      nodeA._executionResult({
        next: nodeB,
      }).next
    ).toEqual(nodeB)
  })
})
