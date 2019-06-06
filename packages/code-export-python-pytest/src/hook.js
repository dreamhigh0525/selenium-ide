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
// KIND, either express or implied.  See the License for the specific language governing permissions and limitations
// under the License.

import exporter from 'code-export-utils'

const emitters = {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  declareDependencies,
  declareMethods: empty,
  declareVariables: empty,
  inEachBegin: empty,
  inEachEnd: empty,
}

function generate(hookName) {
  return new exporter.hook(emitters[hookName]())
}

export function generateHooks() {
  let result = {}
  Object.keys(emitters).forEach(hookName => {
    result[hookName] = generate(hookName)
  })
  return result
}

function afterAll() {
  const params = {
    startingSyntax: {
      commands: [{ level: 0, statement: 'def teardown_class(cls):' }],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: '' }],
    },
    registrationLevel: 1,
  }
  return params
}

function afterEach() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: 'def teardown_method(self, method):' },
        { level: 1, statement: 'self.driver.quit();' },
      ],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: '' }],
    },
  }
  return params
}

function beforeAll() {
  const params = {
    startingSyntax: {
      commands: [{ level: 0, statement: 'def setup_class(cls):' }],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: '' }],
    },
    registrationLevel: 1,
  }
  return params
}

function beforeEach() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: 'def setup_method(self, method):' },
        { level: 1, statement: 'self.driver = webdriver.Firefox()' },
        { level: 1, statement: 'self.vars = {}' },
      ],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: '' }],
    },
  }
  return params
}

function declareDependencies() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: 'import pytest' },
        { level: 0, statement: 'import time' },
        { level: 0, statement: 'import json' },
        { level: 0, statement: 'from selenium import webdriver' },
        {
          level: 0,
          statement: 'from selenium.webdriver.common.by import By',
        },
        {
          level: 0,
          statement:
            'from selenium.webdriver.common.action_chains import ActionChains',
        },
        {
          level: 0,
          statement:
            'from selenium.webdriver.support import expected_conditions',
        },
      ],
    },
  }
  return params
}

function empty() {
  return {}
}
