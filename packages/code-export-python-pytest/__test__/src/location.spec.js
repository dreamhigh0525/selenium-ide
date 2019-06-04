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

import { emit } from '../../src/location'

describe('location code emitter', () => {
  it('should fail to emit empty string', () => {
    return expect(() => {
      emit('')
    }).toThrow("Locator can't be empty")
  })
  it('should fail to emit unknown locator', () => {
    return expect(() => {
      emit('notExists=element')
    }).toThrow('Unknown locator notExists')
  })
  it('should emit id locator', () => {
    const type = 'id'
    const selector = 'someId'
    return expect(emit(`${type}=${selector}`)).resolves.toEqual({
      by: 'By.ID',
      value: `"${selector}"`,
    })
  })
  it('should emit link locator', () => {
    const type = 'link'
    const selector = 'someLink'
    return expect(emit(`${type}=${selector}`)).resolves.toEqual({
      by: 'By.LINK_TEXT',
      value: `"${selector}"`,
    })
  })
  it('should emit linkText locator', () => {
    const type = 'linkText'
    const selector = 'someLink'
    return expect(emit(`${type}=${selector}`)).resolves.toEqual({
      by: 'By.LINK_TEXT',
      value: `"${selector}"`,
    })
  })
  it('should emit partialLinkText locator', () => {
    const type = 'partialLinkText'
    const selector = 'someLink'
    return expect(emit(`${type}=${selector}`)).resolves.toEqual({
      by: 'By.PARTIAL_LINK_TEXT',
      value: `"${selector}"`,
    })
  })
  it('should emit css locator', () => {
    const type = 'css'
    const selector = 'someCss'
    return expect(emit(`${type}=${selector}`)).resolves.toEqual({
      by: 'By.CSS_SELECTOR',
      value: `"${selector}"`,
    })
  })
  it('should emit css locator with `=` sign', () => {
    const type = 'css'
    const selector = 'a[title=JScript]'
    return expect(emit(`${type}=${selector}`)).resolves.toEqual({
      by: 'By.CSS_SELECTOR',
      value: `"${selector}"`,
    })
  })
  it('should escape quotes in locator strings', () => {
    const type = 'css'
    const selector = 'a[title="escaped"]'
    return expect(emit(`${type}=${selector}`)).resolves.toEqual({
      by: 'By.CSS_SELECTOR',
      value: `"a[title=\\"escaped\\"]"`,
    })
  })
  it('should emit xpath locator', () => {
    const type = 'xpath'
    const selector = 'someXpath'
    return expect(emit(`${type}=${selector}`)).resolves.toEqual({
      by: 'By.XPATH',
      value: `"${selector}"`,
    })
  })
  it('should emit implicit xpath locator', () => {
    const selector = '//test=xpath'
    return expect(emit(selector)).resolves.toEqual({
      by: 'By.XPATH',
      value: `"${selector}"`,
    })
  })
  it('should emit name locator', () => {
    const type = 'name'
    const selector = 'someName'
    return expect(emit(`${type}=${selector}`)).resolves.toEqual({
      by: 'By.NAME',
      value: `"${selector}"`,
    })
  })
})
