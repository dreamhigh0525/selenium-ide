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

import exporter from 'code-export-utils'

const emitters = {
  id: emitId,
  value: emitValue,
  label: emitLabel,
  index: emitIndex,
}

export function emit(location) {
  return exporter.emit.selection(location, emitters)
}

export default {
  emit,
}

function emitId(id) {
  return Promise.resolve(`By.cssSelector("*[id='${id}']")`)
}

function emitValue(value) {
  return Promise.resolve(`By.cssSelector("*[value='${value}']")`)
}

function emitLabel(label) {
  return Promise.resolve(`By.xpath("//option[. = '${label}']")`)
}

function emitIndex(index) {
  return Promise.resolve(`By.cssSelector("*:nth-child(${index})")`)
}
