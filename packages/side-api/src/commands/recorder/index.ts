import type { Shape as GetFrameLocation } from './getFrameLocation'
import type { Shape as OnFrameDeleted } from './onFrameDeleted'
import type { Shape as OnFrameRecalculate } from './onFrameRecalculate'
import type { Shape as OnHighlightElement } from './onHighlightElement'
import type { Shape as OnNewWindow } from './onNewWindow'
import type { Shape as RequestHighlightElement } from './requestHighlightElement'
import type { Shape as OnRequestSelectElement } from './onRequestSelectElement'
import type { Shape as RecordNewCommand } from './recordNewCommand'
import type { Shape as RequestSelectElement } from './requestSelectElement'
import type { Shape as SelectElement } from './selectElement'
import type { Shape as SetWindowHandle } from './setWindowHandle'
import type { Shape as Start } from './start'
import type { Shape as Stop } from './stop'

import * as getFrameLocation from './getFrameLocation'
import * as onFrameDeleted from './onFrameDeleted'
import * as onFrameRecalculate from './onFrameRecalculate'
import * as onHighlightElement from './onHighlightElement'
import * as onNewWindow from './onNewWindow'
import * as requestHighlightElement from './requestHighlightElement'
import * as onRequestSelectElement from './onRequestSelectElement'
import * as recordNewCommand from './recordNewCommand'
import * as requestSelectElement from './requestSelectElement'
import * as selectElement from './selectElement'
import * as setWindowHandle from './setWindowHandle'
import * as start from './start'
import * as stop from './stop'

export const commands = {
  getFrameLocation,
  onFrameDeleted,
  onFrameRecalculate,
  onHighlightElement,
  onNewWindow,
  requestHighlightElement,
  onRequestSelectElement,
  recordNewCommand,
  requestSelectElement,
  selectElement,
  setWindowHandle,
  start,
  stop,
}

/**
 * Provides all hooks for recording the frontend interactions across frames
 * and windows.
 */
export type Shape = {
  getFrameLocation: GetFrameLocation
  onFrameDeleted: OnFrameDeleted
  onFrameRecalculate: OnFrameRecalculate
  onHighlightElement: OnHighlightElement
  onNewWindow: OnNewWindow
  onRequestSelectElement: OnRequestSelectElement
  recordNewCommand: RecordNewCommand
  requestHighlightElement: RequestHighlightElement
  requestSelectElement: RequestSelectElement
  selectElement: SelectElement
  setWindowHandle: SetWindowHandle
  start: Start
  stop: Stop
}
