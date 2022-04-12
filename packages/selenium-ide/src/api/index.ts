import { BaseApi } from './types'
import * as dialogs from './commands/dialogs'
import * as driver from './commands/driver'
import * as playback from './commands/playback'
import * as plugins from './commands/plugins'
import * as projects from './commands/projects'
import * as recorder from './commands/recorder'
import * as state from './commands/state'
import * as suites from './commands/suites'
import * as system from './commands/system'
import * as tests from './commands/tests'
import * as variables from './commands/variables'
import * as windows from './commands/windows'
export * as models from './models'

export interface Api extends BaseApi {
  dialogs: typeof dialogs
  driver: typeof driver
  playback: typeof playback
  plugins: typeof plugins
  projects: typeof projects
  recorder: typeof recorder
  state: typeof state
  suites: typeof suites
  system: typeof system
  tests: typeof tests
  variables: typeof variables
  windows: typeof windows
}

export const api: Api = {
  dialogs,
  driver,
  playback,
  plugins,
  projects,
  recorder,
  state,
  suites,
  system,
  tests,
  variables,
  windows,
}

export default api
