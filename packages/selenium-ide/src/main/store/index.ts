import config from './config'
import Store from 'electron-store'
import { StateShape, UserPrefs } from '@seleniumhq/side-api'
import { BrowserInfo } from 'main/types'
import { defaultUserPrefs } from '@seleniumhq/side-api/dist/models/state'

export interface StorageSchema {
  config: typeof config
  browserInfo: BrowserInfo
  plugins: string[]
  projectStates: Record<string, Omit<StateShape, 'playback' | 'recorder' | 'status'>>
  recentProjects: string[]
  windowSize: number[]
  windowPosition: number[]
  userPrefs: UserPrefs
}

const store = new Store<StorageSchema>({
  defaults: {
    browserInfo: {
      browser: 'chrome',
      version: '',
    },
    config,
    plugins: [],
    projectStates: {},
    recentProjects: [],
    windowSize: [],
    windowPosition: [],
    userPrefs: defaultUserPrefs
  },
})

export default store
