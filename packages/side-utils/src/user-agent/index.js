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

import parser from 'ua-parser-js'

const userAgent =
  window && window.navigator && window.navigator.userAgent
    ? parser(window.navigator.userAgent)
    : undefined
const browser = userAgent && userAgent.browser ? userAgent.browser : undefined
const isChrome = browser && browser.name === 'Chrome'
const isFirefox = browser && browser.name === 'Firefox'
const browserName = isChrome || isFirefox ? browser.name : undefined

module.exports = {
  userAgent,
  browserName,
  isChrome,
  isFirefox,
}
