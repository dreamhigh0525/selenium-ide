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

import { codeExport as exporter } from '@seleniumhq/side-utils'
import location from './location'
import selection from './selection'

export const emitters = {
  addSelection: emitSelect,
  answerOnNextPrompt: skip,
  assert: emitAssert,
  assertAlert: emitAssertAlert,
  assertChecked: emitVerifyChecked,
  assertConfirmation: emitAssertAlert,
  assertEditable: emitVerifyEditable,
  assertElementPresent: emitVerifyElementPresent,
  assertElementNotPresent: emitVerifyElementNotPresent,
  assertNotChecked: emitVerifyNotChecked,
  assertNotEditable: emitVerifyNotEditable,
  assertNotSelectedValue: emitVerifyNotSelectedValue,
  assertNotText: emitVerifyNotText,
  assertPrompt: emitAssertAlert,
  assertSelectedLabel: emitVerifySelectedLabel,
  assertSelectedValue: emitVerifySelectedValue,
  assertValue: emitVerifyValue,
  assertText: emitVerifyText,
  assertTitle: emitVerifyTitle,
  check: emitCheck,
  chooseCancelOnNextConfirmation: skip,
  chooseCancelOnNextPrompt: skip,
  chooseOkOnNextConfirmation: skip,
  click: emitClick,
  clickAt: emitClick,
  close: emitClose,
  debugger: skip,
  do: emitControlFlowDo,
  doubleClick: emitDoubleClick,
  doubleClickAt: emitDoubleClick,
  dragAndDropToObject: emitDragAndDrop,
  echo: emitEcho,
  editContent: emitEditContent,
  else: emitControlFlowElse,
  elseIf: emitControlFlowElseIf,
  end: emitControlFlowEnd,
  executeScript: emitExecuteScript,
  executeAsyncScript: emitExecuteAsyncScript,
  forEach: emitControlFlowForEach,
  if: emitControlFlowIf,
  mouseDown: emitMouseDown,
  mouseDownAt: emitMouseDown,
  mouseMove: emitMouseMove,
  mouseMoveAt: emitMouseMove,
  mouseOver: emitMouseMove,
  mouseOut: emitMouseOut,
  mouseUp: emitMouseUp,
  mouseUpAt: emitMouseUp,
  open: emitOpen,
  pause: emitPause,
  removeSelection: emitSelect,
  repeatIf: emitControlFlowRepeatIf,
  run: emitRun,
  runScript: emitRunScript,
  select: emitSelect,
  selectFrame: emitSelectFrame,
  selectWindow: emitSelectWindow,
  sendKeys: emitSendKeys,
  setSpeed: emitSetSpeed,
  setWindowSize: emitSetWindowSize,
  store: emitStore,
  storeAttribute: emitStoreAttribute,
  //storeJson: emitStoreJson,
  storeText: emitStoreText,
  storeTitle: emitStoreTitle,
  storeValue: emitStoreValue,
  storeWindowHandle: emitStoreWindowHandle,
  storeXpathCount: emitStoreXpathCount,
  submit: emitSubmit,
  times: emitControlFlowTimes,
  type: emitType,
  uncheck: emitUncheck,
  verify: emitAssert,
  verifyChecked: emitVerifyChecked,
  verifyEditable: emitVerifyEditable,
  verifyElementPresent: emitVerifyElementPresent,
  verifyElementNotPresent: emitVerifyElementNotPresent,
  verifyNotChecked: emitVerifyNotChecked,
  verifyNotEditable: emitVerifyNotEditable,
  verifyNotSelectedValue: emitVerifyNotSelectedValue,
  verifyNotText: emitVerifyNotText,
  verifySelectedLabel: emitVerifySelectedLabel,
  verifySelectedValue: emitVerifySelectedValue,
  verifyText: emitVerifyText,
  verifyTitle: emitVerifyTitle,
  verifyValue: emitVerifyValue,
  waitForElementEditable: emitWaitForElementEditable,
  waitForElementPresent: emitWaitForElementPresent,
  waitForElementVisible: emitWaitForElementVisible,
  waitForElementNotEditable: emitWaitForElementNotEditable,
  waitForElementNotPresent: emitWaitForElementNotPresent,
  waitForElementNotVisible: emitWaitForElementNotVisible,
  webDriverAnswerOnVisiblePrompt: emitAnswerOnNextPrompt,
  webDriverChooseCancelOnVisibleConfirmation: emitChooseCancelOnNextConfirmation,
  webDriverChooseCancelOnVisiblePrompt: emitChooseCancelOnNextConfirmation,
  webDriverChooseOkOnVisibleConfirmation: emitChooseOkOnNextConfirmation,
  while: emitControlFlowWhile,
}

exporter.register.preprocessors(emitters)

function register(command, emitter) {
  exporter.register.emitter({ command, emitter, emitters })
}

function emit(command) {
  return exporter.emit.command(command, emitters[command.command], {
    variableLookup,
    emitNewWindowHandling,
  })
}

function canEmit(commandName) {
  return !!emitters[commandName]
}

function variableLookup(varName) {
  return `vars["${varName}"].ToString()`
}

function variableSetter(varName, value) {
  return varName ? `vars.Add("${varName}", ${value});` : ''
}

// TODO: add `using System.Threading;` to deps
function emitWaitForWindow() {
  const generateMethodDeclaration = name => {
    return `public String ${name}(int timeout) {`
  }
  const commands = [
    { level: 0, statement: 'try {' },
    { level: 1, statement: 'Thread.Sleep(timeout);' },
    { level: 0, statement: '} catch(Exception e) {' },
    { level: 1, statement: 'Console.WriteLine("{0} Exception caught.", e);' },
    { level: 0, statement: '}' },
    { level: 0, statement: 'var whNow = Driver.WindowHandles;' },
    {
      level: 0,
      statement: 'var whThen = vars["window_handles"];',
    },
    { level: 0, statement: 'if (whNow.Count > whThen.Count) {' },
    { level: 1, statement: 'whNow.removeAll(whThen);' },
    { level: 0, statement: '}' },
    { level: 0, statement: 'return whNow.iterator().next();' },
  ]
  return Promise.resolve({
    name: 'waitForWindow',
    commands,
    generateMethodDeclaration,
  })
}

async function emitNewWindowHandling(command, emittedCommand) {
  return Promise.resolve(
    `vars.Add("window_handles", Driver.WindowHandles);\n${await emittedCommand}\nvars.Add("${
      command.windowHandleName
    }", waitForWindow(${command.windowTimeout}));`
  )
}

function emitAssert(varName, value) {
  return Promise.resolve(
    `Assert.That(vars["${varName}"].ToString(), Is.EqualTo("${value}"));`
  )
}

function emitAssertAlert(alertText) {
  return Promise.resolve(
    `Assert.That(Driver.SwitchTo().Alert().Text, Is.EqualTo("${alertText}"));`
  )
}

function emitAnswerOnNextPrompt(textToSend) {
  const commands = [
    { level: 0, statement: '{' },
    { level: 1, statement: 'Alert alert = Driver.SwitchTo().Alert();' },
    { level: 1, statement: `alert.SendKeys("${textToSend}")` },
    { level: 1, statement: 'alert.Accept();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitCheck(locator) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `var element = Driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'if (!element.Selected) {' },
    { level: 2, statement: 'element.Click();' },
    { level: 1, statement: '}' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

function emitChooseCancelOnNextConfirmation() {
  return Promise.resolve(`Driver.SwitchTo().Alert().Dismiss();`)
}

function emitChooseOkOnNextConfirmation() {
  return Promise.resolve(`Driver.SwitchTo().Alert().Accept();`)
}

async function emitClick(target) {
  return Promise.resolve(
    `Driver.FindElement(${await location.emit(target)}).Click();`
  )
}

async function emitClose() {
  return Promise.resolve(`Driver.Close();`)
}

function generateExpressionScript(script) {
  const scriptString = script.script.replace(/"/g, "'")
  return `(Boolean) js.executeScript("return (${scriptString})"${generateScriptArguments(
    script
  )})`
}

function emitControlFlowDo() {
  return Promise.resolve({
    commands: [{ level: 0, statement: 'do {' }],
    endingLevelAdjustment: 1,
  })
}

function emitControlFlowElse() {
  return Promise.resolve({
    commands: [{ level: 0, statement: '} else {' }],
    startingLevelAdjustment: -1,
    endingLevelAdjustment: +1,
  })
}

function emitControlFlowElseIf(script) {
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `} else if (${generateExpressionScript(script)}) {`,
      },
    ],
    startingLevelAdjustment: -1,
    endingLevelAdjustment: +1,
  })
}

function emitControlFlowEnd() {
  return Promise.resolve({
    commands: [{ level: 0, statement: `}` }],
    startingLevelAdjustment: -1,
  })
}

function emitControlFlowIf(script) {
  return Promise.resolve({
    commands: [
      { level: 0, statement: `if (${generateExpressionScript(script)}) {` },
    ],
    endingLevelAdjustment: 1,
  })
}

function emitControlFlowForEach(collectionVarName, iteratorVarName) {
  return Promise.resolve({
    commands: [
      {
        level: 0,
        statement: `ArrayList collection = (ArrayList) vars["${collectionVarName}"];`,
      },
      {
        level: 0,
        statement: `for (int i = 0; i < collection.size() - 1; i++) {`,
      },
      {
        level: 1,
        statement: `vars.Add("${iteratorVarName}", collection.get(i));`,
      },
    ],
  })
}

function emitControlFlowRepeatIf(script) {
  return Promise.resolve({
    commands: [
      { level: 0, statement: `} while (${generateExpressionScript(script)});` },
    ],
    startingLevelAdjustment: -1,
  })
}

function emitControlFlowTimes(target) {
  const commands = [
    { level: 0, statement: `Integer times = ${target};` },
    { level: 0, statement: 'for(int i = 0; i < times; i++) {' },
  ]
  return Promise.resolve({ commands, endingLevelAdjustment: 1 })
}

function emitControlFlowWhile(script) {
  return Promise.resolve({
    commands: [
      { level: 0, statement: `while (${generateExpressionScript(script)}) {` },
    ],
    endingLevelAdjustment: 1,
  })
}

async function emitDoubleClick(target) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = Driver.FindElement(${await location.emit(
        target
      )});`,
    },
    { level: 1, statement: 'Actions builder = new Actions(Driver);' },
    { level: 1, statement: 'builder.doubleClick(element).Perform();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitDragAndDrop(dragged, dropped) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement dragged = Driver.FindElement(${await location.emit(
        dragged
      )});`,
    },
    {
      level: 1,
      statement: `WebElement dropped = Driver.FindElement(${await location.emit(
        dropped
      )});`,
    },
    { level: 1, statement: 'Actions builder = new Actions(Driver);' },
    { level: 1, statement: 'builder.dragAndDrop(dragged, dropped).Perform();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitEcho(message) {
  const _message = message.startsWith('vars[') ? message : `"${message}"`
  return Promise.resolve(`System.out.println(${_message});`)
}

async function emitEditContent(locator, content) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = Driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement: `js.executeScript("if(arguments[0].contentEditable === 'true') {arguments[0].innerText = '${content}'}", element);`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitExecuteScript(script, varName) {
  const result = `js.executeScript("${script.script}"${generateScriptArguments(
    script
  )})`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitExecuteAsyncScript(script, varName) {
  const result = `js.executeAsyncScript("var callback = arguments[arguments.length - 1];${
    script.script
  }.then(callback).catch(callback);${generateScriptArguments(script)}")`
  return Promise.resolve(variableSetter(varName, result))
}

function generateScriptArguments(script) {
  return `${script.argv.length ? ', ' : ''}${script.argv
    .map(varName => `vars["${varName}"]`)
    .join(',')}`
}

async function emitMouseDown(locator) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = Driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'Actions builder = new Actions(Driver);' },
    {
      level: 1,
      statement: 'builder.MoveToElement(element).ClickAndHold().Perform();',
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseMove(locator) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = Driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'Actions builder = new Actions(Driver);' },
    { level: 1, statement: 'builder.MoveToElement(element).Perform();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseOut() {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = Driver.FindElement(By.tagName("body"));`,
    },
    { level: 1, statement: 'Actions builder = new Actions(Driver);' },
    { level: 1, statement: 'builder.MoveToElement(element, 0, 0).Perform();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitMouseUp(locator) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = Driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'Actions builder = new Actions(Driver);' },
    {
      level: 1,
      statement: 'builder.MoveToElement(element).Release().Perform();',
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

function emitOpen(target) {
  const url = /^(file|http|https):\/\//.test(target)
    ? `"${target}"`
    : `"${global.baseUrl}${target}"`
  return Promise.resolve(`Driver.get(${url});`)
}

async function emitPause(time) {
  const commands = [
    { level: 0, statement: 'try {' },
    { level: 1, statement: `Thread.Sleep(${time});` },
    { level: 0, statement: '} catch (InterruptedException e) {' },
    { level: 1, statement: 'e.printStackTrace();' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitRun(testName) {
  return Promise.resolve(`${exporter.parsers.sanitizeName(testName)}();`)
}

async function emitRunScript(script) {
  return Promise.resolve(
    `js.executeScript("${script.script}${generateScriptArguments(script)}");`
  )
}

// TODO: add `System.Drawing` to deps
async function emitSetWindowSize(size) {
  const [width, height] = size.split('x')
  return Promise.resolve(
    `Driver.Manage().Window.Size = new Size(${width}, ${height});`
  )
}

async function emitSelect(selectElement, option) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement dropdown = Driver.FindElement(${await location.emit(
        selectElement
      )});`,
    },
    {
      level: 1,
      statement: `dropdown.FindElement(${await selection.emit(
        option
      )}).Click();`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitSelectFrame(frameLocation) {
  if (frameLocation === 'relative=top' || frameLocation === 'relative=parent') {
    return Promise.resolve('Driver.SwitchTo().DefaultContent();')
  } else if (/^index=/.test(frameLocation)) {
    return Promise.resolve(
      `Driver.SwitchTo().Frame(${Math.floor(
        frameLocation.split('index=')[1]
      )});`
    )
  } else {
    return Promise.resolve({
      commands: [
        { level: 0, statement: '{' },
        {
          level: 1,
          statement: `WebElement element = Driver.FindElement(${await location.emit(
            frameLocation
          )});`,
        },
        { level: 1, statement: 'Driver.SwitchTo().Frame(element);' },
        { level: 0, statement: '}' },
      ],
    })
  }
}

async function emitSelectWindow(windowLocation) {
  if (/^handle=/.test(windowLocation)) {
    return Promise.resolve(
      `Driver.SwitchTo().Window(${windowLocation.split('handle=')[1]});`
    )
  } else if (/^name=/.test(windowLocation)) {
    return Promise.resolve(
      `Driver.SwitchTo().Window("${windowLocation.split('name=')[1]}");`
    )
  } else if (/^win_ser_/.test(windowLocation)) {
    if (windowLocation === 'win_ser_local') {
      return Promise.resolve({
        commands: [
          { level: 0, statement: '{' },
          {
            level: 1,
            statement:
              'ArrayList<String> handles = new ArrayList<String>(Driver.getWindowHandles());',
          },
          { level: 1, statement: 'Driver.SwitchTo().Window(handles.get(0));' },
          { level: 0, statement: '}' },
        ],
      })
    } else {
      const index = parseInt(windowLocation.substr('win_ser_'.length))
      return Promise.resolve({
        commands: [
          { level: 0, statement: '{' },
          {
            level: 1,
            statement:
              'ArrayList<String> handles = new ArrayList<String>(Driver.getWindowHandles());',
          },
          {
            level: 1,
            statement: `Driver.SwitchTo().Window(handles.get(${index}));`,
          },
          { level: 0, statement: '}' },
        ],
      })
    }
  } else {
    return Promise.reject(
      new Error('Can only emit `select window` using handles')
    )
  }
}

function generateSendKeysInput(value) {
  if (typeof value === 'object') {
    return value
      .map(s => {
        if (s.startsWith('vars[')) {
          return s
        } else if (s.startsWith('Key[')) {
          const key = s.match(/\['(.*)'\]/)[1]
          return `Keys.${key}`
        } else {
          return `"${s}"`
        }
      })
      .join(', ')
  } else {
    if (value.startsWith('vars[')) {
      return value
    } else {
      return `"${value}"`
    }
  }
}

async function emitSendKeys(target, value) {
  return Promise.resolve(
    `Driver.FindElement(${await location.emit(
      target
    )}).SendKeys(${generateSendKeysInput(value)});`
  )
}

function emitSetSpeed() {
  return Promise.resolve(
    `System.out.println("\`set speed\` is a no-op in code export, use \`pause\` instead");`
  )
}

async function emitStore(value, varName) {
  return Promise.resolve(variableSetter(varName, `"${value}"`))
}

async function emitStoreAttribute(locator, varName) {
  const attributePos = locator.lastIndexOf('@')
  const elementLocator = locator.slice(0, attributePos)
  const attributeName = locator.slice(attributePos + 1)
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = Driver.FindElement(${await location.emit(
        elementLocator
      )});`,
    },
    {
      level: 1,
      statement: `String attribute = element.getAttribute("${attributeName}");`,
    },
    { level: 1, statement: `${variableSetter(varName, 'attribute')}` },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

//async function emitStoreJson(_json, _varName) {
//  // TODO
//  return Promise.resolve('')
//}

async function emitStoreText(locator, varName) {
  const result = `Driver.FindElement(${await location.emit(locator)}).Text`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitStoreTitle(_, varName) {
  return Promise.resolve(variableSetter(varName, 'Driver.Title'))
}

async function emitStoreValue(locator, varName) {
  const result = `Driver.FindElement(${await location.emit(
    locator
  )}).GetAttribute("value")`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitStoreWindowHandle(varName) {
  return Promise.resolve(variableSetter(varName, 'Driver.CurrentWindowHandle'))
}

async function emitStoreXpathCount(locator, varName) {
  const result = `Driver.FindElements(${await location.emit(locator)}).Count`
  return Promise.resolve(variableSetter(varName, result))
}

async function emitSubmit(_locator) {
  return Promise.resolve(
    `throw new Error("\`submit\` is not a supported command in Selenium WebDriver. Please re-record the step in the IDE.");`
  )
}

async function emitType(target, value) {
  return Promise.resolve(
    `Driver.FindElement(${await location.emit(
      target
    )}).SendKeys(${generateSendKeysInput(value)});`
  )
}

async function emitUncheck(locator) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = Driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'if (element.Selected()) {' },
    { level: 2, statement: 'element.Click();' },
    { level: 1, statement: '}' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyChecked(locator) {
  return Promise.resolve(
    `assertTrue(Driver.FindElement(${await location.emit(
      locator
    )}).Selected());`
  )
}

async function emitVerifyEditable(locator) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = Driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement:
        'Boolean isEditable = element.Enabled() && element.GetAttribute("readonly") == null;',
    },
    { level: 1, statement: 'assertTrue(isEditable);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyElementPresent(locator) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `List<WebElement> elements = Driver.FindElements(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'assert(elements.Count > 0);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyElementNotPresent(locator) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `List<WebElement> elements = Driver.FindElements(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'assert(elements.Count == 0);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotChecked(locator) {
  return Promise.resolve(
    `assertFalse(Driver.FindElement(${await location.emit(
      locator
    )}).Selected());`
  )
}

async function emitVerifyNotEditable(locator) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = Driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    {
      level: 1,
      statement:
        'Boolean isEditable = element.Enabled && element.GetAttribute("readonly") == null;',
    },
    { level: 1, statement: 'assertFalse(isEditable);' },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotSelectedValue(locator, expectedValue) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `String value = Driver.FindElement(${await location.emit(
        locator
      )}).GetAttribute("value");`,
    },
    {
      level: 1,
      statement: `Assert.That(value, Is.Not.EqualTo("${exporter.emit.text(
        expectedValue
      )}"));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyNotText(locator, text) {
  const result = `Driver.FindElement(${await location.emit(locator)}).Text`
  return Promise.resolve(
    `Assert.That(${result}, Is.Not.EqualTo("${exporter.emit.text(text)}"));`
  )
}

async function emitVerifySelectedLabel(locator, labelValue) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebElement element = Driver.FindElement(${await location.emit(
        locator
      )});`,
    },
    { level: 1, statement: 'String value = element.GetAttribute("value");' },
    {
      level: 1,
      statement: `String locator = String.format("option[@value='%s']", value);`,
    },
    {
      level: 1,
      statement:
        'String selectedText = element.FindElement(By.xpath(locator)).Text;',
    },
    {
      level: 1,
      statement: `Assert.That(selectedText, Is.EqualTo("${labelValue}"));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitVerifySelectedValue(locator, value) {
  return emitVerifyValue(locator, value)
}

async function emitVerifyText(locator, text) {
  return Promise.resolve(
    `Assert.That(Driver.FindElement(${await location.emit(
      locator
    )}).Text, Is.EqualTo("${exporter.emit.text(text)}"));`
  )
}

async function emitVerifyValue(locator, value) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `String value = Driver.FindElement(${await location.emit(
        locator
      )}).getAttribute("value");`,
    },
    { level: 1, statement: `Assert.That(value, Is.EqualTo("${value}"));` },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitVerifyTitle(title) {
  return Promise.resolve(
    `Assert.That(Driver.getTitle(), Is.EqualTo("${title}"));`
  )
}

async function emitWaitForElementEditable(locator, timeout) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(Driver, System.TimeSpan.FromSeconds(${Math.floor(
        timeout / 1000
      )}));`,
    },
    {
      level: 1,
      statement: `wait.until(driver => driver.FindElement(${await location.emit(
        locator
      )}).Enabled);`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

function skip() {
  return Promise.resolve('')
}

async function emitWaitForElementPresent(locator, timeout) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(Driver, System.TimeSpan.FromSeconds(${Math.floor(
        timeout / 1000
      )}));`,
    },
    {
      level: 1,
      statement: `wait.until(driver => driver.FindElement(${await location.emit(
        locator
      )}));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({ commands })
}

async function emitWaitForElementVisible(locator, timeout) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(Driver, System.TimeSpan.FromSeconds(${Math.floor(
        timeout / 1000
      )}));`,
    },
    {
      level: 1,
      statement: `wait.until(driver => driver.FindElement(${await location.emit(
        locator
      )}).Displayed);`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotEditable(locator, timeout) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(Driver, System.TimeSpan.FromSeconds(${Math.floor(
        timeout / 1000
      )}));`,
    },
    {
      level: 1,
      statement: `wait.until(driver => !driver.FindElement(${await location.emit(
        locator
      )}).Enabled);`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

async function emitWaitForElementNotPresent(locator, timeout) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(Driver, System.TimeSpan.FromSeconds(${Math.floor(
        timeout / 1000
      )}));`,
    },
    {
      level: 1,
      statement: `wait.until(driver => !driver.FindElement(${await location.emit(
        locator
      )}));`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

// TODO: add `using OpenQA.Selenium.Support.UI;` to deps
async function emitWaitForElementNotVisible(locator, timeout) {
  const commands = [
    { level: 0, statement: '{' },
    {
      level: 1,
      statement: `WebDriverWait wait = new WebDriverWait(Driver, System.TimeSpan.FromSeconds(${Math.floor(
        timeout / 1000
      )}));`,
    },
    {
      level: 1,
      statement: `wait.until(driver => !driver.FindElement(${await location.emit(
        locator
      )}).Displayed);`,
    },
    { level: 0, statement: '}' },
  ]
  return Promise.resolve({
    commands,
  })
}

export default {
  canEmit,
  emit,
  register,
  extras: { emitWaitForWindow },
}
