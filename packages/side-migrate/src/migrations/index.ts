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

import { ProjectShape } from '@seleniumhq/side-model'

import pause from './pause'
import implicitLocators from './implicit-locators'
import scriptInterpolation from './script-interpolation'
import waitForCommands from './wait-for-commands'
import variableName from './variable-name'
import selectWindow from './select-window'
import prompt from './prompt'
import title from './title'
import storeElementCount from './store-element-count'
import targetFallback from './target-fallback'

export const migrators: Record<string, MigratorFunction> = {
  pause,
  implicitLocators,
  scriptInterpolation,
  waitForCommands,
  variableName,
  selectWindow,
  prompt,
  title,
  storeElementCount,
  targetFallback,
} as const

type MigratorFunction = {
  version: string
  (p: ProjectShape): ProjectShape
}

type MigrationsVersionLibrary = Record<string, MigratorFunction>
type MigrationsLibrary = Record<string, MigrationsVersionLibrary>

const migrations: MigrationsLibrary = Object.keys(migrators).reduce(
  (migs, migName) => {
    const mig = migrators[migName]
    if (!migs[mig.version]) {
      migs[mig.version] = {}
    }
    migs[mig.version][migName] = mig

    return migs
  },
  {} as MigrationsLibrary
)

export default migrations
