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

export const ControlFlowCommandNames = {
  do: 'do',
  else: 'else',
  elseIf: 'elseIf',
  end: 'end',
  forEach: 'forEach',
  if: 'if',
  repeatIf: 'repeatIf',
  times: 'times',
  while: 'while',
}

function commandNamesEqual(command, target) {
  if (command) {
    return command.command === target
  } else {
    return false
  }
}

function isBlockOpen(command) {
  return isIf(command) || isLoop(command)
}

function isConditional(command) {
  switch (command.command) {
    case ControlFlowCommandNames.elseIf:
    case ControlFlowCommandNames.if:
    case ControlFlowCommandNames.repeatIf:
    case ControlFlowCommandNames.times:
    case ControlFlowCommandNames.while:
      return true
    default:
      return false
  }
}

function isControlFlow(command) {
  switch (command.command) {
    case ControlFlowCommandNames.if:
    case ControlFlowCommandNames.elseIf:
    case ControlFlowCommandNames.else:
    case ControlFlowCommandNames.end:
    case ControlFlowCommandNames.do:
    case ControlFlowCommandNames.repeatIf:
    case ControlFlowCommandNames.times:
    case ControlFlowCommandNames.while:
      return true
    default:
      return false
  }
}

function isDo(command) {
  return commandNamesEqual(command, ControlFlowCommandNames.do)
}

function isElse(command) {
  return commandNamesEqual(command, ControlFlowCommandNames.else)
}

function isElseIf(command) {
  return commandNamesEqual(command, ControlFlowCommandNames.elseIf)
}

function isElseOrElseIf(command) {
  return isElseIf(command) || isElse(command)
}

function isEnd(command) {
  return commandNamesEqual(command, ControlFlowCommandNames.end)
}

function isIf(command) {
  return commandNamesEqual(command, ControlFlowCommandNames.if)
}

function isIfBlock(command) {
  return isIf(command) || isElseOrElseIf(command)
}

function isLoop(command) {
  return (
    commandNamesEqual(command, ControlFlowCommandNames.while) ||
    commandNamesEqual(command, ControlFlowCommandNames.times) ||
    commandNamesEqual(command, ControlFlowCommandNames.repeatIf) ||
    commandNamesEqual(command, ControlFlowCommandNames.forEach)
  )
}

function isTerminal(command) {
  return isElse(command) || isDo(command) || isEnd(command)
}

function isTimes(command) {
  return commandNamesEqual(command, ControlFlowCommandNames.times)
}

function isForEach(command) {
  return commandNamesEqual(command, ControlFlowCommandNames.forEach)
}

export const ControlFlowCommandChecks = {
  isIfBlock: isIfBlock,
  isConditional: isConditional,
  isDo: isDo,
  isElse: isElse,
  isElseOrElseIf: isElseOrElseIf,
  isEnd: isEnd,
  isIf: isIf,
  isLoop: isLoop,
  isBlockOpen: isBlockOpen,
  isTerminal: isTerminal,
  isControlFlow: isControlFlow,
  isTimes: isTimes,
  isForEach: isForEach,
}
