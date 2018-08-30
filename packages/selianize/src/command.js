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

import config from "./config";
import LocationEmitter from "./location";
import SelectionEmitter from "./selection";
import { convertToSnake } from "./utils";

const emitters = {
  open: emitOpen,
  click: emitClick,
  clickAt: emitClick,
  check: emitCheck,
  uncheck: emitUncheck,
  doubleClick: emitDoubleClick,
  doubleClickAt: emitDoubleClick,
  dragAndDropToObject: emitDragAndDrop,
  type: emitType,
  sendKeys: emitSendKeys,
  echo: emitEcho,
  run: emitRun,
  runScript: emitRunScript,
  executeScript: emitExecuteScript,
  executeAsyncScript: emitExecuteAsyncScript,
  pause: emitPause,
  verifyChecked: emitVerifyChecked,
  verifyNotChecked: emitVerifyNotChecked,
  verifyEditable: emitVerifyEditable,
  verifyNotEditable: emitVerifyNotEditable,
  verifyElementPresent: emitVerifyElementPresent,
  verifyElementNotPresent: emitVerifyElementNotPresent,
  verifySelectedValue: emitVerifySelectedValue,
  verifyNotSelectedValue: emitVerifyNotSelectedValue,
  verifyValue: emitVerifyValue,
  verifyText: emitVerifyText,
  verifyTitle: emitVerifyTitle,
  verifyNotText: emitVerifyNotText,
  verifySelectedLabel: emitVerifySelectedLabel,
  assertChecked: emitVerifyChecked,
  assertNotChecked: emitVerifyNotChecked,
  assertEditable: emitVerifyEditable,
  assertNotEditable: emitVerifyNotEditable,
  assertElementPresent: emitVerifyElementPresent,
  assertElementNotPresent: emitVerifyElementNotPresent,
  assertSelectedValue: emitVerifySelectedValue,
  assertNotSelectedValue: emitVerifyNotSelectedValue,
  assertValue: emitVerifyValue,
  assertText: emitVerifyText,
  assertTitle: emitVerifyTitle,
  assertSelectedLabel: emitVerifySelectedLabel,
  store: emitStore,
  storeText: emitStoreText,
  storeValue: emitStoreValue,
  storeTitle: emitStoreTitle,
  storeXpathCount: emitStoreXpathCount,
  storeAttribute: emitStoreAttribute,
  select: emitSelect,
  addSelection: emitSelect,
  removeSelection: emitSelect,
  selectFrame: emitSelectFrame,
  selectWindow: emitSelectWindow,
  mouseDown: emitMouseDown,
  mouseDownAt: emitMouseDown,
  mouseUp: emitMouseUp,
  mouseUpAt: emitMouseUp,
  mouseMove: emitMouseMove,
  mouseMoveAt: emitMouseMove,
  mouseOver: emitMouseMove,
  mouseOut: emitMouseOut,
  assertAlert: emitAssertAlertAndAccept,
  assertNotText: emitVerifyNotText,
  assertPrompt: emitAssertAlert,
  assertConfirmation: emitAssertAlert,
  webdriverAnswerOnVisiblePrompt: emitAnswerOnNextPrompt,
  webdriverChooseOkOnVisibleConfirmation: emitChooseOkOnNextConfirmation,
  webdriverChooseCancelOnVisibleConfirmation: emitChooseCancelOnNextConfirmation,
  webdriverChooseCancelOnVisiblePrompt: emitChooseCancelOnNextConfirmation,
  editContent: emitEditContent,
  submit: emitSubmit,
  answerOnNextPrompt: skip,
  chooseCancelOnNextConfirmation: skip,
  chooseCancelOnNextPrompt: skip,
  chooseOkOnNextConfirmation: skip,
  setSpeed: emitSetSpeed,
  do: emitControlFlowDo,
  else: emitControlFlowElse,
  elseIf: emitControlFlowElseIf,
  end: emitControlFlowEnd,
  if: emitControlFlowIf,
  repeatIf: emitControlFlowRepeatIf,
  times: emitControlFlowTimes,
  while: emitControlFlowWhile,
  assert: emitAssert,
  verify: emitAssert
};

export function emit(command, options = config, snapshot) {
  return new Promise(async (res, rej) => {
    if (emitters[command.command]) {
      if (options.skipStdLibEmitting && !emitters[command.command].isAdditional)
        return res({ skipped: true });
      try {
        let result = await emitters[command.command](
          preprocessParameter(command.target, emitters[command.command].target),
          preprocessParameter(command.value, emitters[command.command].value)
        );
        res(result);
      } catch (e) {
        rej(e);
      }
    } else if (options.skipStdLibEmitting) {
      res({ skipped: true });
    } else {
      if (!command.command) {
        res();
      } else if (snapshot) {
        res(snapshot);
      } else {
        rej(new Error(`Unknown command ${command.command}`));
      }
    }
  });
}

export function canEmit(commandName) {
  return !!(emitters[commandName]);
}

function preprocessParameter(param, preprocessor) {
  if (preprocessor) {
    return preprocessor(param);
  }
  return defaultPreprocessor(param);
}

function defaultPreprocessor(param) {
  return param ? param.replace(/\$\{/g, "${vars.") : param;
}

export function scriptPreprocessor(script) {
  let value = script.replace(/^\s+/, "").replace(/\s+$/, "");
  let r2;
  let parts = [];
  const variablesUsed = {};
  const argv = [];
  let argl = 0; // length of arguments
  if (/\$\{/.exec(value)) {
    const regexp = /\$\{(.*?)\}/g;
    let lastIndex = 0;
    while ((r2 = regexp.exec(value))) {
      const variableName = r2[1];
      if (r2.index - lastIndex > 0) {
        parts.push(value.substring(lastIndex, r2.index));
      }
      if (!variablesUsed.hasOwnProperty(variableName)) {
        variablesUsed[variableName] = argl;
        argv.push(variableName);
        argl++;
      }
      parts.push(`arguments[${variablesUsed[variableName]}]`);
      lastIndex = regexp.lastIndex;
    }
    if (lastIndex < value.length) {
      parts.push(value.substring(lastIndex, value.length));
    }
    return {
      script: parts.join(""),
      argv
    };
  } else {
    return {
      script: value,
      argv
    };
  }
}

function keysPreprocessor(str) {
  let keys = [];
  let match = str.match(/\$\{\w+\}/g);
  if (!match) {
    keys.push(str);
  } else {
    let i = 0;
    while (i < str.length) {
      let currentKey = match.shift(), currentKeyIndex = str.indexOf(currentKey, i);
      if (currentKeyIndex > i) {
        // push the string before the current key
        keys.push(str.substr(i, currentKeyIndex - i));
        i = currentKeyIndex;
      }
      if (currentKey) {
        if (/^\$\{KEY_\w+\}/.test(currentKey)) {
          // is a key
          let keyName = currentKey.match(/\$\{KEY_(\w+)\}/)[1];
          keys.push(`Key["${keyName}"]`);
        } else {
          // not a key, assume stored variables interpolation
          keys.push(defaultPreprocessor(currentKey));
        }
        i += currentKey.length;
      } else if (i < str.length) {
        // push the rest of the string
        keys.push(str.substr(i, str.length));
        i = str.length;
      }
    }
  }
  return keys;
}

function generateScript(script, isExpression = false) {
  return `await driver.executeScript(\`${isExpression ? `return (${script.script})` : script.script }\`${script.argv.length ? "," : ""}${script.argv.map((n) => (`vars["${n}"]`)).join(",")});`;
}

export function registerEmitter(command, emitter) {
  if (!canEmit(command)) {
    emitters[command] = emitter;
    emitters[command].isAdditional = true;
  }
}

export default {
  canEmit,
  emit,
  registerEmitter
};

function emitOpen(target) {
  const url = /^(file|http|https):\/\//.test(target) ? `"${target}"` : `(new URL("${target}", BASE_URL)).href`;
  return Promise.resolve(`await driver.get(${url});`);
}

async function emitClick(target) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(target)}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(target)}).then(element => {element.click();});`);
}

async function emitDoubleClick(target) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(target)}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(target)}).then(element => {driver.actions().doubleClick(element).perform();});`);
}

async function emitDragAndDrop(dragged, dropzone) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(dragged)}), configuration.timeout);await driver.wait(until.elementLocated(${await LocationEmitter.emit(dropzone)}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(dragged)}).then(dragged => {driver.findElement(${await LocationEmitter.emit(dropzone)}).then(dropzone => {driver.actions().dragAndDrop(dragged, dropzone).perform();});});`);
}

async function emitType(target, value) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(target)}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(target)}).then(element => {element.clear().then(() => {element.sendKeys(\`${value}\`);});});`);
}

async function emitSendKeys(target, value) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(target)}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(target)}).then(element => {element.sendKeys(${value.map((s) => (s.startsWith("Key[") ? s : `\`${s}\``)).join(",")});});`);
}

emitSendKeys.value = keysPreprocessor;

async function emitEcho(message) {
  return Promise.resolve(`console.log(\`${message}\`);`);
}

async function emitCheck(locator) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(locator)}).then(element => { element.isSelected().then(selected => {if(!selected) { element.click();}}); });`);
}

async function emitUncheck(locator) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(locator)}).then(element => { element.isSelected().then(selected => {if(selected) { element.click();}}); });`);
}

async function emitRun(testCase) {
  return Promise.resolve(`await tests.${convertToSnake(testCase)}(driver, vars, { isNested: true });`);
}

async function emitRunScript(script) {
  return Promise.resolve(generateScript(script));
}

emitRunScript.target = scriptPreprocessor;

async function emitExecuteScript(script, varName) {
  return Promise.resolve((varName ? `vars["${varName}"] = ` : "") + generateScript(script));
}

emitExecuteScript.target = scriptPreprocessor;

async function emitExecuteAsyncScript(script, varName) {
  return Promise.resolve((varName ? `vars["${varName}"] = ` : "") + `await driver.executeAsyncScript(\`var callback = arguments[arguments.length - 1];${script.script}.then(callback).catch(callback);\`${script.argv.length ? "," : ""}${script.argv.map((n) => (`vars["${n}"]`)).join(",")});`);
}

emitExecuteAsyncScript.target = scriptPreprocessor;

async function emitPause(time) {
  return Promise.resolve(`await driver.sleep(${time});`);
}

async function emitVerifyChecked(locator) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await expect(driver.findElement(${await LocationEmitter.emit(locator)})).resolves.toBeChecked();`);
}

async function emitVerifyNotChecked(locator) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await expect(driver.findElement(${await LocationEmitter.emit(locator)})).resolves.not.toBeChecked();`);
}

async function emitVerifyEditable(locator) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await expect(driver.findElement(${await LocationEmitter.emit(locator)})).resolves.toBeEditable();`);
}

async function emitVerifyNotEditable(locator) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await expect(driver.findElement(${await LocationEmitter.emit(locator)})).resolves.not.toBeEditable();`);
}

async function emitVerifyElementPresent(locator) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await expect(driver.findElements(${await LocationEmitter.emit(locator)})).resolves.toBePresent();`);
}

async function emitVerifyElementNotPresent(locator) {
  return Promise.resolve(`await expect(driver.findElements(${await LocationEmitter.emit(locator)})).resolves.not.toBePresent();`);
}

async function emitVerifySelectedValue(locator, value) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await expect(driver.findElement(${await LocationEmitter.emit(locator)})).resolves.toHaveSelectedValue(\`${value}\`);`);
}

async function emitVerifySelectedLabel(locator, labelValue) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(locator)}).then(element => {element.getAttribute("value").then(selectedValue => {element.findElement(By.xpath('option[@value="'+selectedValue+'"]')).then(selectedOption => {selectedOption.getText().then(selectedLabel => {expect(selectedLabel).toBe(\`${labelValue}\`);});});});});`);
}

async function emitVerifyNotSelectedValue(locator, value) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await expect(driver.findElement(${await LocationEmitter.emit(locator)})).resolves.not.toHaveSelectedValue(\`${value}\`);`);
}

async function emitVerifyValue(locator, value) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await expect(driver.findElement(${await LocationEmitter.emit(locator)})).resolves.toHaveValue(\`${value}\`);`);
}

async function emitVerifyText(locator, text) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await expect(driver.findElement(${await LocationEmitter.emit(locator)})).resolves.toHaveText(\`${text}\`);`);
}

async function emitVerifyNotText(locator, text) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(locator)}).then(element => {element.getText().then(text => {expect(text).not.toBe(\`${text}\`)});});`);
}

async function emitVerifyTitle(title) {
  return Promise.resolve(`await driver.getTitle().then(title => {expect(title).toBe(\`${title}\`);});`);
}

async function emitStore(value, varName) {
  return Promise.resolve(`vars["${varName}"] = \`${value}\`;`);
}

async function emitStoreText(locator, varName) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(locator)}).then(element => {element.getText().then(text => {vars["${varName}"] = text;});});`);
}

async function emitStoreValue(locator, varName) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(locator)}).then(element => {element.getAttribute("value").then(value => {vars["${varName}"] = value;});});`);
}

async function emitStoreTitle(_, varName) {
  return Promise.resolve(`await driver.getTitle().then(title => {vars["${varName}"] = title;});`);
}

async function emitStoreXpathCount(locator, varName) {
  return Promise.resolve(`await driver.wait(until.elementsLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await driver.findElements(${await LocationEmitter.emit(locator)}).then(elements => {vars["${varName}"] = elements.length;});`);
}

async function emitStoreAttribute(locator, varName) {
  const attributePos = locator.lastIndexOf("@");
  const elementLocator = locator.slice(0, attributePos);
  const attributeName = locator.slice(attributePos + 1);

  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(elementLocator)}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(elementLocator)}).then(element => element.getAttribute("${attributeName}").then(attribute => {vars["${varName}"] = attribute;}));`);
}

async function emitSelect(selectElement, option) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(selectElement)}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(selectElement)}).then(element => {element.findElement(${await SelectionEmitter.emit(option)}).then(option => {option.click();});});`);
}

async function emitSelectFrame(frameLocation) {
  if (frameLocation === "relative=top") {
    return Promise.resolve("await driver.switchTo().frame();");
  } else if (/^index=/.test(frameLocation)) {
    return Promise.resolve(`await driver.switchTo().frame(${frameLocation.split("index=")[1]});`);
  } else {
    return Promise.resolve(`await driver.findElement(${await LocationEmitter.emit(frameLocation)}).then(frame => {driver.switchTo().frame(frame);});`);
  }
}

function emitSelectWindow(windowLocation) {
  if (/^name=/.test(windowLocation)) {
    return Promise.resolve(`await driver.switchTo().window(\`${windowLocation.split("name=")[1]}\`);`);
  } else {
    return Promise.reject(new Error("Can only emit `select window` using name locator"));
  }
}

async function emitMouseDown(locator) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(locator)}).then(element => {driver.actions().mouseDown(element).perform();});`);
}

async function emitMouseUp(locator) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(locator)}).then(element => {driver.actions().mouseUp(element).perform();});`);
}

async function emitMouseMove(locator) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(locator)}).then(element => {driver.actions().mouseMove(element).perform();});`);
}

async function emitMouseOut(locator) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(locator)}).then(element => {driver.actions().mouseMove(element, {x: -1, y: -1}).perform();});`);
}

function emitAssertAlert(alertText) {
  return Promise.resolve(`await driver.switchTo().alert().then(alert => {alert.getText().then(text => {expect(text).toBe(\`${alertText}\`);});});`);
}

function emitAssertAlertAndAccept(alertText) {
  return Promise.resolve(`await driver.switchTo().alert().then(alert => {alert.getText().then(text => {expect(text).toBe(\`${alertText}\`);alert.accept();});});`);
}

function emitChooseOkOnNextConfirmation() {
  return Promise.resolve("await driver.switchTo().alert().then(alert => {alert.accept();});");
}

function emitChooseCancelOnNextConfirmation() {
  return Promise.resolve("await driver.switchTo().alert().then(alert => {alert.dismiss();});");
}

function emitAnswerOnNextPrompt(textToSend) {
  return Promise.resolve(`await driver.switchTo().alert().then(alert => {alert.sendKeys(\`${textToSend}\`).then(() => {alert.accept();});});`);
}

async function emitEditContent(locator, content) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(locator)}).then(element => {driver.executeScript(\`if(arguments[0].contentEditable === 'true') {arguments[0].innerHTML = '${content}'}\`, element);});`);
}

async function emitSubmit(locator) {
  return Promise.resolve(`await driver.wait(until.elementLocated(${await LocationEmitter.emit(locator)}), configuration.timeout);await driver.findElement(${await LocationEmitter.emit(locator)}).then(element => {element.submit();});`);
}

function skip() {
  return Promise.resolve();
}

function emitControlFlowDo() {
  return Promise.resolve("do {");
}

function emitControlFlowElse() {
  return Promise.resolve("} else {");
}

function emitControlFlowElseIf(script) {
  return Promise.resolve(`} else if (!!${generateScript(script, true).slice(0, -1)}) {`);
}

emitControlFlowElseIf.target = scriptPreprocessor;

function emitControlFlowEnd() {
  return Promise.resolve("}");
}

function emitControlFlowIf(script) {
  return Promise.resolve(`if (!!${generateScript(script, true).slice(0, -1)}) {`);
}

emitControlFlowIf.target = scriptPreprocessor;

function emitControlFlowRepeatIf(target) {
  return Promise.resolve(`} while (!!${generateScript(target, true).slice(0, -1)});`);
}

emitControlFlowRepeatIf.target = scriptPreprocessor;

function emitControlFlowTimes(target) {
  return Promise.resolve(`const times = ${target};for(let i = 0; i < times; i++) {`);
}

function emitControlFlowWhile(target) {
  return Promise.resolve(`while (!!${generateScript(target, true).slice(0, -1)}) {`);
}

emitControlFlowWhile.target = scriptPreprocessor;

function emitAssert(varName, value) {
  return Promise.resolve(`expect(${varName.replace(/\$\{/, "").replace(/\}/, "")}.toString() == "${value}").toBeTruthy();`);
}

function emitSetSpeed() {
  return Promise.resolve("console.warn('`set speed` is a no-op in the runner, use `pause instead`');");
}
