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

export { default as Playback } from './playback'
export { default as Variables } from './variables'
export { default as WebDriverExecutor } from './webdriver'
import { CommandType as _CommandType } from './playback-tree/command-node'
import createRecorderSyncronizer from './recording-syncronizer'
import createRecorderSyncronizerForWebdriverExecutor from './recording-syncronizer-webdriver'

export * from './playback'
export * from './types'
export const CommandType = _CommandType
export const RecordingSyncronizers = {
  createRecorderSyncronizer,
  createRecorderSyncronizerForWebdriverExecutor,
}
