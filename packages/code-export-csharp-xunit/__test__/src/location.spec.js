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
  it('should emit Id locator', () => {
    const type = 'Id'
    const selector = 'someId'
    return expect(emit(`${type}=${selector}`)).resolves.toBe(
      `By.Id("${selector}")`
    )
  })
  it('should emit Link locator', () => {
    const type = 'Link'
    const selector = 'someLink'
    return expect(emit(`${type}=${selector}`)).resolves.toBe(
      `By.LinkText("${selector}")`
    )
  })
  it('should emit LinkText locator', () => {
    const type = 'LinkText'
    const selector = 'someLink'
    return expect(emit(`${type}=${selector}`)).resolves.toBe(
      `By.LinkText("${selector}")`
    )
  })
  it('should emit PartialLinkText locator', () => {
    const type = 'PartialLinkText'
    const selector = 'someLink'
    return expect(emit(`${type}=${selector}`)).resolves.toBe(
      `By.PartialLinkText("${selector}")`
    )
  })
  it('should emit css locator', () => {
    const type = 'css'
    const selector = 'someCss'
    return expect(emit(`${type}=${selector}`)).resolves.toBe(
      `By.CssSelector("${selector}")`
    )
  })
  it('should emit css locator with `=` sign', () => {
    const type = 'css'
    const selector = 'a[title=JScript]'
    return expect(emit(`${type}=${selector}`)).resolves.toBe(
      `By.CssSelector("${selector}")`
    )
  })
  it('should escape quotes in locator strings', () => {
    const type = 'css'
    const selector = 'a[title="escaped"]'
    return expect(emit(`${type}=${selector}`)).resolves.toMatchSnapshot()
  })
  it('should emit XPath locator', () => {
    const type = 'XPath'
    const selector = 'someXpath'
    return expect(emit(`${type}=${selector}`)).resolves.toBe(
      `By.XPath("${selector}")`
    )
  })
  it('should emit implicit XPath locator', () => {
    const selector = '//test=XPath'
    return expect(emit(selector)).resolves.toBe(`By.XPath("${selector}")`)
  })
  it('should emit name locator', () => {
    const type = 'name'
    const selector = 'someName'
    return expect(emit(`${type}=${selector}`)).resolves.toBe(
      `By.Name("${selector}")`
    )
  })
})
