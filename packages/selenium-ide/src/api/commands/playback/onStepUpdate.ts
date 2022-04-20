import { PlaybackEventShapes } from '@seleniumhq/side-runtime'
import { getActiveTest, getCommandIndex } from 'api/helpers/getActiveData'
import { EventMutator, StateShape } from 'api/types'
import browserEventListener from 'browser/api/classes/EventListener'
import merge from 'lodash/fp/merge'
import mainEventListener from 'main/api/classes/EventListener'
import { PlaybackStateShape } from 'api/models/state'
import { TestShape } from '@seleniumhq/side-model'

export type OnStepUpdatePlayback = [
  PlaybackEventShapes['COMMAND_STATE_CHANGED']
]

export type StateUpdateShape = Partial<Omit<StateShape, 'playback'>> & {
  playback: Partial<PlaybackStateShape>
}

const getHasCommand = (commandID: string) => (t: TestShape) =>
  t.commands.find((cmd) => cmd.id === commandID)

export const mutator: EventMutator<OnStepUpdatePlayback> = (
  session,
  [data]
) => {
  const stateUpdates: StateUpdateShape = {
    playback: {
      commands: { [data.id]: data },
    },
  }
  const isExecuting = data.state === 'executing'
  if (isExecuting) {
    stateUpdates.playback.currentIndex = getCommandIndex(session, data.id)
    stateUpdates.activeCommandID = data.id
  }
  const test = getActiveTest(session)
  const hasCommand = getHasCommand(data.id)
  if (!hasCommand(test)) {
    const { tests } = session.project
    const nextActiveTest = tests.find(hasCommand) as TestShape
    stateUpdates.activeTestID = nextActiveTest.id
  }

  return merge(session, { state: stateUpdates })
}

export const browser = browserEventListener<OnStepUpdatePlayback>()
export const main = mainEventListener<OnStepUpdatePlayback>()