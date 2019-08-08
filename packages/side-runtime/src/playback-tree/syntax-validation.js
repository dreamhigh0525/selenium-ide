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

import { ControlFlowCommandNames, ControlFlowCommandChecks } from './commands'
import { State } from './state'
import { ControlFlowSyntaxError } from './control-flow-syntax-error'

export function validateControlFlowSyntax(commandStack) {
  let state = new State()
  commandStack.forEach(function(command, commandIndex) {
    validateCommand(command, commandIndex, state)
  })
  if (!state.empty()) {
    throw new ControlFlowSyntaxError(
      'Incomplete block at ' + state.top().command,
      state.top().index
    )
  } else {
    return true
  }
}

function validateCommand(command, commandIndex, state) {
  if (!command.skip && commandValidators[command.command]) {
    return commandValidators[command.command](
      command.command,
      commandIndex,
      state
    )
  }
}

const commandValidators = {
  [ControlFlowCommandNames.do]: trackControlFlowBranchOpen,
  [ControlFlowCommandNames.else]: validateElse,
  [ControlFlowCommandNames.elseIf]: validateElseIf,
  [ControlFlowCommandNames.end]: validateEnd,
  [ControlFlowCommandNames.forEach]: trackControlFlowBranchOpen,
  [ControlFlowCommandNames.if]: trackControlFlowBranchOpen,
  [ControlFlowCommandNames.repeatIf]: validateRepeatIf,
  [ControlFlowCommandNames.times]: trackControlFlowBranchOpen,
  [ControlFlowCommandNames.while]: trackControlFlowBranchOpen,
}

function trackControlFlowBranchOpen(commandName, commandIndex, state) {
  state.push({ command: commandName, index: commandIndex })
}

function validateElse(commandName, commandIndex, state) {
  if (!ControlFlowCommandChecks.isIfBlock(state.top())) {
    throw new ControlFlowSyntaxError(
      'An else used outside of an if block',
      commandIndex
    )
  }
  if (ControlFlowCommandChecks.isElse(state.top())) {
    throw new ControlFlowSyntaxError(
      'Too many else commands used',
      commandIndex
    )
  }
  state.push({ command: commandName, index: commandIndex })
}

function validateElseIf(commandName, commandIndex, state) {
  if (!ControlFlowCommandChecks.isIfBlock(state.top())) {
    throw new ControlFlowSyntaxError(
      'An else if used outside of an if block',
      commandIndex
    )
  }
  if (ControlFlowCommandChecks.isElse(state.top())) {
    throw new ControlFlowSyntaxError(
      'Incorrect command order of else if / else',
      commandIndex
    )
  }
  state.push({ command: commandName, index: commandIndex })
}

function validateEnd(commandName, commandIndex, state) {
  if (ControlFlowCommandChecks.isBlockOpen(state.top())) {
    state.pop()
  } else if (ControlFlowCommandChecks.isElseOrElseIf(state.top())) {
    state.pop()
    validateEnd(commandName, commandIndex, state)
  } else {
    throw new ControlFlowSyntaxError(
      'Use of end without an opening keyword',
      commandIndex
    )
  }
}

function validateRepeatIf(_commandName, commandIndex, state) {
  if (!ControlFlowCommandChecks.isDo(state.top())) {
    repeatIfError(commandIndex)
  }
  state.pop()
}

export function repeatIfError(commandIndex) {
  throw new ControlFlowSyntaxError(
    'A repeat if used without a do block',
    commandIndex
  )
}
