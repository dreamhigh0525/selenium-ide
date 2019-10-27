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

import stringEscape from '../string-escape'
import { preprocessParameter } from './preprocessor'
import doRender from './render'
import { registerMethod } from './register'
import { findReusedTestMethods, findCommandThatOpensWindow } from './find'
import { Commands } from '@seleniumhq/side-model'

function validateCommand(command) {
  const commandName = command.command
  if (!commandName.startsWith('//')) {
    let commandSchema = Commands.find(cmdObj => cmdObj[0] === commandName)
    if (commandSchema) commandSchema = commandSchema[1]
    else throw new Error(`Invalid command '${commandName}'`)
    if (!!commandSchema.target !== !!command.target) {
      const isOptional = !!commandSchema.target.isOptional
      if (!isOptional) {
        throw new Error(
          `Incomplete command '${
            command.command
          }'. Missing expected target argument.`
        )
      }
    }
    if (!!commandSchema.value !== !!command.value) {
      const isOptional = !!commandSchema.value.isOptional
      if (!isOptional) {
        throw new Error(
          `Incomplete command '${commandName}'. Missing expected value argument.`
        )
      }
    }
  }
}

export function emitCommand(
  command,
  emitter,
  { variableLookup, emitNewWindowHandling } = {}
) {
  validateCommand(command)
  if (emitter) {
    const ignoreEscaping = command.command === 'storeJson'
    let result = emitter(
      preprocessParameter(
        command.target,
        emitter.targetPreprocessor,
        variableLookup,
        { ignoreEscaping }
      ),
      preprocessParameter(
        command.value,
        emitter.valuePreprocessor,
        variableLookup,
        { ignoreEscaping }
      )
    )
    if (command.opensWindow) result = emitNewWindowHandling(command, result)
    return result
  }
}

export function emitLocation(location, emitters) {
  if (/^\/\//.test(location)) {
    return emitters.xpath(location)
  }
  const fragments = location.split('=')
  const type = fragments.shift()
  const selector = fragments.join('=')
  if (emitters[type]) {
    return emitters[type](selector)
  } else {
    throw new Error(type ? `Unknown locator ${type}` : "Locator can't be empty")
  }
}

export function emitSelection(location, emitters) {
  if (!location) throw new Error(`Location can't be empty`)
  const [type, selector] = location.split('=')
  if (emitters[type] && selector) {
    let result = emitters[type](selector)
    return result
  } else if (!selector) {
    // no selector strategy given, assuming label
    return emitters['label'](type)
  } else {
    throw new Error(`Unknown selection locator ${type}`)
  }
}

async function emitCommands(commands, emitter) {
  const _commands = commands.map(command => {
    return emitter.emit(command)
  })
  const emittedCommands = await Promise.all(_commands)
  let result = []
  emittedCommands.forEach(entry => {
    if (typeof entry === 'string' && entry.includes('\n')) {
      entry.split('\n').forEach(subEntry => {
        result.push(subEntry)
      })
    } else {
      result.push(entry)
    }
  })
  return result
}

async function emitMethod(
  method,
  {
    commandPrefixPadding,
    generateMethodDeclaration,
    terminatingKeyword,
    emitter,
    overrideCommandEmitting,
  } = {}
) {
  const methodDeclaration = generateMethodDeclaration(method.name)
  let _methodDeclaration = methodDeclaration
  let _terminatingKeyword = terminatingKeyword
  if (typeof methodDeclaration === 'object') {
    _methodDeclaration = methodDeclaration.body
    _terminatingKeyword = methodDeclaration.terminatingKeyword
  }
  let result
  if (overrideCommandEmitting) {
    result = method.commands.map(
      cmd => `${commandPrefixPadding.repeat(cmd.level) + cmd.statement}`
    )
  } else {
    result = await emitCommands(method.commands, emitter)
  }
  return [
    _methodDeclaration,
    result.join(`\n${commandPrefixPadding}`).replace(/^/, commandPrefixPadding),
    _terminatingKeyword,
  ]
}

export function emitOriginTracing(test, { commentPrefix }) {
  let result = []
  result.push(commentPrefix + ` Test name: ${test.name}`)
  result.push(commentPrefix + ' Step # | name | target | value | comment')
  test.commands.forEach((command, index) => {
    result.push(
      commentPrefix +
        ` ${index + 1} | ${command.command} | ${command.target} | ${
          command.value
        } | ${command.comment}`
    )
  })
  return result
}

async function emitTest(
  test,
  tests,
  {
    testLevel,
    commandLevel,
    testDeclaration,
    terminatingKeyword,
    commandPrefixPadding,
    commentPrefix,
    hooks,
    emitter,
    generateMethodDeclaration,
    enableOriginTracing,
    project,
  } = {}
) {
  // preamble
  let result = {}
  testLevel = testLevel || 1
  commandLevel = commandLevel || 2
  const methods = findReusedTestMethods(test, tests)
  const render = doRender.bind(this, commandPrefixPadding)

  // handle extra dynamic emitters that aren't tied to an explicit command
  if (emitter.extras) {
    for (const emitter_name in emitter.extras) {
      let ignore = true
      if (
        emitter_name === 'emitWaitForWindow' &&
        findCommandThatOpensWindow(test, tests)
      )
        ignore = false
      if (!ignore) {
        const method = await emitter.extras[emitter_name]()
        const result = await emitMethod(method, {
          emitter,
          commandPrefixPadding,
          generateMethodDeclaration: method.generateMethodDeclaration,
          terminatingKeyword,
          overrideCommandEmitting: true,
        })
        await registerMethod(method.name, result, {
          generateMethodDeclaration: method.generateMethodDeclaration,
          hooks,
        })
      }
    }
  }

  // handle reused test methods (e.g., commands that use the `run` command)
  for (const method of methods) {
    const result = await emitMethod(method, {
      emitter,
      commandPrefixPadding,
      generateMethodDeclaration,
      terminatingKeyword,
    })
    await registerMethod(method.name, result, {
      generateMethodDeclaration,
      hooks,
    })
  }

  // prepare origin tracing code commands if enabled
  const originTracing = enableOriginTracing
    ? emitOriginTracing(test, { commentPrefix })
    : undefined

  // prepare result object
  result.testDeclaration = render(testDeclaration, {
    startingLevel: testLevel,
  })
  result.inEachBegin = render(
    await hooks.inEachBegin.emit({ test, tests, project, isOptional: true }),
    {
      startingLevel: commandLevel,
    }
  )
  result.commands = render(
    await emitCommands(test.commands, emitter).catch(error => {
      // prefix test name on error
      throw new Error(`Test '${test.name}' has a problem: ${error.message}`)
    }),
    {
      startingLevel: commandLevel,
      originTracing,
    }
  )
  result.inEachEnd = render(
    await hooks.inEachEnd.emit({ test, tests, project, isOptional: true }),
    {
      startingLevel: commandLevel,
    }
  )
  result.testEnd = render(terminatingKeyword, { startingLevel: testLevel })

  return result
}

async function emitTestsFromSuite(
  tests,
  suite,
  languageOpts,
  { enableOriginTracing, generateTestDeclaration, project }
) {
  let result = {}
  for (const testName of suite.tests) {
    const test = tests.find(test => test.name === testName)
    const testDeclaration = generateTestDeclaration(test.name)
    result[test.name] = await emitTest(test, tests, {
      ...languageOpts,
      testDeclaration,
      enableOriginTracing,
      project,
    })
  }
  return result
}

async function emitSuite(
  body,
  tests,
  {
    suiteLevel,
    testLevel,
    suiteName,
    suiteDeclaration,
    terminatingKeyword,
    commandPrefixPadding,
    commentPrefix,
    hooks,
    suite,
    project,
  } = {}
) {
  // preamble
  let result = {}
  testLevel = testLevel || 1
  suiteLevel = suiteLevel || 0
  if (!suite) suite = { name: suiteName }
  const render = doRender.bind(this, commandPrefixPadding)

  // prepare result object
  result.headerComment = commentPrefix + ' Generated by Selenium IDE\n'
  result.dependencies = render(
    await hooks.declareDependencies.emit({ suite, tests, project })
  )
  result.suiteDeclaration = render(suiteDeclaration, {
    startingLevel: suiteLevel,
  })
  result.variables = render(
    await hooks.declareVariables.emit({ suite, tests, project }),
    {
      startingLevel: testLevel,
    }
  )
  result.beforeAll = render(
    await hooks.beforeAll.emit({ suite, tests, project, isOptional: true }),
    {
      startingLevel: testLevel,
    }
  )
  result.beforeEach = render(
    await hooks.beforeEach.emit({ suite, tests, project }),
    {
      startingLevel: testLevel,
    }
  )
  result.afterEach = render(
    await hooks.afterEach.emit({ suite, tests, project }),
    {
      startingLevel: testLevel,
    }
  )
  result.afterAll = render(
    await hooks.afterAll.emit({ suite, tests, project, isOptional: true }),
    {
      startingLevel: testLevel,
    }
  )
  result.methods = render(
    await hooks.declareMethods.emit({
      suite,
      tests,
      project,
      isOptional: true,
    }),
    {
      startingLevel: testLevel,
    }
  )
  result.tests = body
  result.suiteEnd = render(terminatingKeyword, {
    startingLevel: suiteLevel,
  })

  // cleanup
  hooks.declareMethods.clearRegister()

  return result
}

function emitOrderedSuite(emittedSuite) {
  let result = ''
  result += emittedSuite.headerComment
  result += emittedSuite.dependencies
  result += emittedSuite.suiteDeclaration
  result += emittedSuite.variables
  result += emittedSuite.beforeAll
  result += emittedSuite.beforeEach
  result += emittedSuite.afterEach
  result += emittedSuite.afterAll
  result += emittedSuite.methods
  if (emittedSuite.tests.testDeclaration) {
    const test = emittedSuite.tests
    result += test.testDeclaration
    result += test.inEachBegin
    result += test.commands
    result += test.inEachEnd
    result += test.testEnd
  } else {
    for (const testName in emittedSuite.tests) {
      const test = emittedSuite.tests[testName]
      result += test.testDeclaration
      result += test.inEachBegin
      result += test.commands
      result += test.inEachEnd
      result += test.testEnd
    }
  }
  result += emittedSuite.suiteEnd
  return result
}

export default {
  command: emitCommand,
  commands: emitCommands,
  location: emitLocation,
  method: emitMethod,
  selection: emitSelection,
  suite: emitSuite,
  orderedSuite: emitOrderedSuite,
  test: emitTest,
  text: stringEscape,
  testsFromSuite: emitTestsFromSuite,
}
