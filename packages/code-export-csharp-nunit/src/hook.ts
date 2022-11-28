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

const emitters = {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  declareDependencies,
  declareVariables,
} as const

export default emitters

function afterAll() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: '[OneTimeTearDown]' },
        { level: 0, statement: 'public void FinalTearDown() {' },
      ],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: '}' }],
    },
    registrationLevel: 1,
  }
  return params
}

function afterEach() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: '[TearDown]' },
        { level: 0, statement: 'protected void TearDown() {' },
        { level: 1, statement: 'driver.Quit();' },
      ],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: '}' }],
    },
  }
  return params
}

function beforeAll() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: '[OneTimeSetUp]' },
        { level: 0, statement: 'public void InitialSetUp() {' },
      ],
    },
    endingSyntax: {
      commands: [{ level: 0, statement: '}' }],
    },
    registrationLevel: 1,
  }
  return params
}

function beforeEach() {
  const params = {
    startingSyntax: (
      { browserName, gridUrl } = { browserName: '', gridUrl: '' }
    ) => ({
      commands: [
        { level: 0, statement: '[SetUp]' },
        { level: 0, statement: 'public void SetUp() {' },
        {
          level: 1,
          statement: gridUrl
            ? `driver = new RemoteWebDriver(new Uri("${gridUrl}"), new ${
                browserName ? browserName : 'Chrome'
              }Options().ToCapabilities());`
            : `driver = new ${browserName ? browserName : 'Chrome'}Driver();`,
        },
        { level: 1, statement: 'js = (IJavaScriptExecutor)driver;' },
        {
          level: 1,
          statement: 'vars = new Dictionary<string, object>();',
        },
      ],
    }),
    endingSyntax: {
      commands: [{ level: 0, statement: '}' }],
    },
  }
  return params
}

function declareDependencies() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: 'using System;' },
        { level: 0, statement: 'using System.Collections;' },
        { level: 0, statement: 'using System.Collections.Generic;' },
        { level: 0, statement: 'using System.Linq;' },
        { level: 0, statement: 'using System.Threading;' },
        { level: 0, statement: 'using OpenQA.Selenium;' },
        { level: 0, statement: 'using OpenQA.Selenium.Chrome;' },
        { level: 0, statement: 'using OpenQA.Selenium.Firefox;' },
        { level: 0, statement: `using OpenQA.Selenium.Remote;` },
        { level: 0, statement: 'using OpenQA.Selenium.Support.UI;' },
        { level: 0, statement: 'using OpenQA.Selenium.Interactions;' },
        { level: 0, statement: 'using NUnit.Framework;' },
      ],
    },
  }
  return params
}

function declareVariables() {
  const params = {
    startingSyntax: {
      commands: [
        { level: 0, statement: 'private IWebDriver driver;' },
        {
          level: 0,
          statement:
            'public IDictionary<string, object> vars {get; private set;}',
        },
        { level: 0, statement: 'private IJavaScriptExecutor js;' },
      ],
    },
  }
  return params
}
