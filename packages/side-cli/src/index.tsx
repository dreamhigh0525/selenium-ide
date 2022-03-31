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

import { ProjectShape, TestShape } from '@seleniumhq/side-model'
import {
  getCustomCommands,
  loadPlugins,
  Playback,
  Variables,
  WebDriverExecutor,
} from '@seleniumhq/side-runtime'
import fs from 'fs'
import { render } from 'ink'
import path from 'path'
import React from 'react'
import PlaybackComponent from './components/playback'

let projectPath = process.argv[2]
if (projectPath.startsWith('.')) {
  projectPath = path.join(process.cwd(), projectPath)
}

const project: ProjectShape = JSON.parse(
  fs.readFileSync(projectPath).toString()
)

const plugins = loadPlugins(require, projectPath, project)
const customCommands = getCustomCommands(plugins)
const executor = new WebDriverExecutor({
  customCommands,
})

const playback = new Playback({
  baseUrl: project.url,
  getTestByName: (name: string) =>
    project.tests.find((t) => t.name === name) as TestShape,
  logger: console,
  executor,
  variables: new Variables(),
})

render(<PlaybackComponent project={project} playback={playback} />)
