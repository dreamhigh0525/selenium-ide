import { EditorStateShape } from 'api/models/state'
import { Mutator } from 'api/types'
import browserHandler from 'browser/api/classes/Handler'
import set from 'lodash/fp/set'
import mainHandler, { passthrough } from 'main/api/classes/Handler'

export type EditorUpdates = Pick<EditorStateShape, 'selectedCommandIndexes'>
export type StateUpdates = { editor: EditorUpdates }

export const mutator: Mutator = (session) =>
  set('state.editor.selectedCommandIndexes', [], session)

export const browser = browserHandler()
export const main = mainHandler(passthrough)
