#!/usr/bin/env node

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

import os from 'os'
import path from 'path'
import crypto from 'crypto'
import util from 'util'
import { Command } from 'commander'
import Capabilities from './capabilities'
import Config from './config'
import ParseProxy from './proxy'
import { Configuration, JSON, SideRunnerAPI } from './types'
import { spawn } from 'child_process'

const metadata = require('../package.json')

const DEFAULT_TIMEOUT = 15000

process.title = metadata.name

const program: SideRunnerAPI = new Command() as SideRunnerAPI
program
  .usage('[options] project.side [project.side] [*.side]')
  .version(metadata.version)
  .option('--base-url [url]', 'Override the base URL that was set in the IDE')
  .option('-c, --capabilities [list]', 'Webdriver capabilities')
  .option('-s, --server [url]', 'Webdriver remote server')
  .option('-p, --params [list]', 'General parameters')
  .option('-f, --filter [string]', 'Run suites matching name')
  .option(
    '-w, --max-workers [number]',
    `Maximum amount of workers that will run your tests, defaults to number of cores`,
    (str) => parseInt(str),
    os.cpus().length
  )
  .option(
    '-t, --timeout [number]',
    `The maximimum amount of time, in milliseconds, to spend attempting to locate an element. (default: ${DEFAULT_TIMEOUT})`,
    (str) => parseInt(str),
    DEFAULT_TIMEOUT
  )
  .option(
    '-x, --proxy-type [type]',
    'Type of proxy to use (one of: direct, manual, pac, socks, system)'
  )
  .option(
    '-y, --proxy-options [list]',
    'Proxy options to pass, for use with manual, pac and socks proxies'
  )
  .option(
    '-n, --config-file [filepath]',
    'Use specified YAML file for configuration. (default: .side.yml)'
  )
  .option(
    '-o, --output-directory [directory]',
    'Write test results to files, format is defined by --output-format'
  )
  .option(
    '-f, --force',
    "Forcibly run the project, regardless of project's version"
  )
  .option('-d, --debug', 'Print debug logs')

program.parse()

if (!program.args.length) {
  program.outputHelp()
  // eslint-disable-next-line no-process-exit
  process.exit(1)
}

const options = program.opts()
const configuration: Configuration = {
  baseUrl: '',
  capabilities: {
    browserName: 'chrome',
  },
  debug: options.debug,
  filter: '*',
  force: options.force,
  maxWorkers: options.maxWorkers,
  params: {},
  projects: program.args.map((arg) => path.join(process.cwd(), arg)),
  proxyOptions: {},
  runId: crypto.randomBytes(16).toString('hex'),
  path: path.join(__dirname, '../../'),
  server: '',
  timeout: options.timeout,
}

const confPath = options.configFile || '.side.yml'
const configFilePath = path.isAbsolute(confPath)
  ? confPath
  : path.join(process.cwd(), confPath)
try {
  Object.assign(configuration, Config.load(configFilePath))
} catch (e) {
  options.debug && console.debug('Could not load ' + configFilePath)
}

if (options.filter) {
  configuration.filter = options.filter
}
configuration.server = options.server ? options.server : configuration.server

if (options.capabilities) {
  try {
    configuration.capabilities = Capabilities.parseString(options.capabilities)
  } catch (e) {
    options.debug && console.debug('Failed to parse inline capabilities')
  }
}

if (options.params) {
  try {
    configuration.params = Capabilities.parseString(options.params)
  } catch (e) {
    options.debug && console.debug('Failed to parse additional params')
  }
}

if (options.proxyType) {
  try {
    let opts
    if (options.proxyType === 'manual' || options.proxyType === 'socks') {
      opts = Capabilities.parseString(options.proxyOptions as string)
    }
    const proxy = ParseProxy(options.proxyType, opts as Record<string, JSON>)
    Object.assign(configuration, proxy)
  } catch (e) {
    console.error((e as Error).message)
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  }
} else if (configuration.proxyType) {
  try {
    const proxy = ParseProxy(
      configuration.proxyType,
      configuration.proxyOptions
    )
    Object.assign(configuration, proxy)
  } catch (e) {
    console.error((e as Error).message)
    // eslint-disable-next-line no-process-exit
    process.exit(1)
  }
}

configuration.baseUrl = options.baseUrl
  ? options.baseUrl
  : configuration.baseUrl

options.debug && console.debug(util.inspect(configuration))

spawn(
  'jest',
  [
    '--config=' + path.join(__dirname, '..', 'jest.config.js'),
    '--runTestsByPath',
    path.join(__dirname, 'main.test.js'),
  ],
  {
    env: {
      ...process.env,
      SE_CONFIGURATION: JSON.stringify(configuration),
    },
    stdio: 'inherit',
  }
)
