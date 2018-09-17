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

import browser from "webextension-polyfill";
import parser from "ua-parser-js";
import Debugger, { convertLocator } from "../debugger";
import PlaybackState from "../../stores/view/PlaybackState";
import variables from "../../stores/view/Variables";
import { absolutifyUrl } from "../playback/utils";
import "./bootstrap";

const parsedUA = parser(window.navigator.userAgent);

export default class ExtCommand {
  constructor(windowSession) {
    this.windowSession = windowSession;
    this.playingTabNames = {};
    this.playingTabIds = {};
    this.playingTabStatus = {};
    this.playingFrameLocations = {};
    this.playingTabCount = 1;
    this.currentPlayingTabId = -1;
    this.currentPlayingWindowId = -1;
    this.currentPlayingFrameLocation = "root";
    // TODO: flexible wait
    this.waitInterval = 500;
    this.waitTimes = 60;

    this.attached = false;

    // Use ES6 arrow function to bind correct this
    this.tabsOnUpdatedHandler = (tabId, changeInfo, tabInfo) => { // eslint-disable-line no-unused-vars
      if (changeInfo.status) {
        if (changeInfo.status == "loading") {
          this.setLoading(tabId);
        } else {
          this.setComplete(tabId);
        }
      }
    };

    this.frameLocationMessageHandler = (message, sender, sendResponse) => {
      if (message.frameLocation) {
        this.setFrame(sender.tab.id, message.frameLocation, sender.frameId);
        sendResponse(true);
      }
    };

    this.newTabHandler = (details) => {
      if (this.hasTab(details.sourceTabId)) {
        this.setNewTab(details.tabId);
      }
    };
  }

  async init(baseUrl, testCaseId) {
    this.attach();
    this.playingTabNames = {};
    this.playingTabIds = {};
    this.playingTabStatus = {};
    this.playingFrameLocations = {};
    this.playingTabCount = 1;
    this.currentPlayingFrameLocation = "root";
    this.baseUrl = baseUrl;
    try {
      await this.attachToRecordingWindow(testCaseId);
    } catch(e) {
      await this.updateOrCreateTab();
    }
  }

  clear() {
    this.detach();
    this.playingTabNames = {};
    this.playingTabIds = {};
    this.playingTabStatus = {};
    this.playingFrameLocations = {};
    this.playingTabCount = 1;
  }

  attach() {
    if(this.attached) {
      return;
    }
    this.attached = true;
    browser.tabs.onUpdated.addListener(this.tabsOnUpdatedHandler);
    browser.runtime.onMessage.addListener(this.frameLocationMessageHandler);
    browser.webNavigation.onCreatedNavigationTarget.addListener(this.newTabHandler);
  }

  detach() {
    if(!this.attached) {
      return;
    }
    this.attached = false;
    browser.tabs.onUpdated.removeListener(this.tabsOnUpdatedHandler);
    browser.runtime.onMessage.removeListener(this.frameLocationMessageHandler);
    browser.webNavigation.onCreatedNavigationTarget.removeListener(this.newTabHandler);
  }

  getCurrentPlayingWindowId() {
    return this.currentPlayingWindowId;
  }

  getCurrentPlayingTabId() {
    return this.currentPlayingTabId;
  }

  getCurrentPlayingFrameLocation() {
    return this.currentPlayingFrameLocation;
  }

  getFrameId(tabId) {
    if (tabId >= 0) {
      return this.playingFrameLocations[tabId][this.currentPlayingFrameLocation];
    } else {
      return this.playingFrameLocations[this.currentPlayingTabId][this.currentPlayingFrameLocation];
    }
  }

  getCurrentPlayingFrameId() {
    return this.getFrameId(this.currentPlayingTabId);
  }

  getPageStatus() {
    return this.playingTabStatus[this.getCurrentPlayingTabId()];
  }

  sendMessage(command, target, value, top) {
    if (/^webdriver/.test(command)) {
      return Promise.resolve({ result: "success" });
    }
    let tabId = this.getCurrentPlayingTabId();
    let frameId = this.getCurrentPlayingFrameId();
    return browser.tabs.sendMessage(tabId, {
      commands: command,
      target: target,
      value: value
    }, { frameId: top ? 0 : frameId });
  }

  sendPayload(payload, top) {
    let tabId = this.getCurrentPlayingTabId();
    let frameId = this.getCurrentPlayingFrameId();
    return browser.tabs.sendMessage(tabId, payload, { frameId: top ? 0 : frameId });
  }

  setLoading(tabId) {
    // Does clearing the object will cause some problem(e.g. missing the frameId)?
    // Ans: Yes, but I don't know why
    this.initTabInfo(tabId);
    // this.initTabInfo(tabId, true); (failed)
    this.playingTabStatus[tabId] = false;
  }

  setComplete(tabId) {
    this.initTabInfo(tabId);
    this.playingTabStatus[tabId] = true;
  }

  initTabInfo(tabId, forced) {
    if (!this.playingFrameLocations[tabId] | forced) {
      this.playingFrameLocations[tabId] = {};
      this.playingFrameLocations[tabId]["root"] = 0;
    }
  }

  setFrame(tabId, frameLocation, frameId) {
    this.playingFrameLocations[tabId][frameLocation] = frameId;
  }

  hasTab(tabId) {
    return this.playingTabIds[tabId];
  }

  setNewTab(tabId) {
    this.playingTabNames["win_ser_" + this.playingTabCount] = tabId;
    this.playingTabIds[tabId] = "win_ser_" + this.playingTabCount;
    this.playingTabCount++;
  }

  doOpen(targetUrl) {
    const url = absolutifyUrl(targetUrl, this.baseUrl);
    return browser.tabs.update(this.currentPlayingTabId, {
      url: url
    });
  }

  doPause(milliseconds) {
    return new Promise(function(resolve) {
      setTimeout(resolve, milliseconds);
    });
  }

  doSelectFrame(frameLocation) {
    let result = frameLocation.match(/(index|relative) *= *([\d]+|parent)/i);
    if (result && result[2]) {
      let position = result[2];
      if (position == "parent") {
        this.currentPlayingFrameLocation = this.currentPlayingFrameLocation.slice(0, this.currentPlayingFrameLocation.lastIndexOf(":"));
      } else {
        this.currentPlayingFrameLocation += ":" + position;
      }
      return this.wait("playingFrameLocations", this.currentPlayingTabId, this.currentPlayingFrameLocation);
    } else {
      return Promise.reject("Invalid argument");
    }
  }

  doSelectWindow(serialNumber) {
    let self = this;
    return this.wait("playingTabNames", serialNumber)
      .then(function() {
        self.currentPlayingTabId = self.playingTabNames[serialNumber];
        browser.tabs.update(self.currentPlayingTabId, { active: true });
      });
  }

  doClose() {
    let removingTabId = this.currentPlayingTabId;
    this.currentPlayingTabId = -1;
    delete this.playingFrameLocations[removingTabId];
    return browser.tabs.remove(removingTabId);
  }

  doRun(target) {
    return Promise.resolve(PlaybackState.callTestCase(target));
  }

  async doMouseOver(locator, _, top) {
    const browserName = parsedUA.browser.name;
    if (browserName === "Chrome") {
      // handle scrolling through Selenium atoms
      const { rect } = await this.sendPayload({
        prepareToInteract: true,
        locator
      }, top);
      const connection = new Debugger(this.currentPlayingTabId);
      try {
        await connection.attach();
        await connection.sendCommand("Input.dispatchMouseEvent", {
          type: "mouseMoved",
          x: rect.x + (rect.width / 2),
          y: rect.y + (rect.height / 2)
        });
        await connection.detach();
        return {
          result: "success"
        };
      } catch (e) {
        await connection.detach();
        throw e;
      }
    } else {
      return this.sendMessage("mouseOver", locator, _, top);
    }
  }

  doType(locator, value, top) {
    if (/^([\w]:\\|\\\\|\/)/.test(value)) {
      const browserName = parsedUA.browser.name;
      if (browserName !== "Chrome") return Promise.reject(new Error("File uploading is only support in Chrome at this time"));
      const connection = new Debugger(this.currentPlayingTabId);
      return connection.attach().then(() => (
        connection.getDocument().then(docNode => (
          this.convertToQuerySelector(locator).then(selector => (
            connection.querySelector(selector, docNode.nodeId).then(nodeId => (
              connection.sendCommand("DOM.setFileInputFiles", { nodeId, files: value.split(",") }).then(connection.detach).then(() => ({ result: "success" }))
            ))
          ))
        ))
      )).catch(e => {
        return connection.detach().then(() => {
          throw e;
        });
      });
    } else {
      return this.sendMessage("type", locator, value, top);
    }
  }

  async doSendKeys(locator, value, top) {
    const browserName = parsedUA.browser.name;
    if (browserName === "Chrome" && value.indexOf("${KEY_ENTER}") !== -1) {
      const connection = new Debugger(this.currentPlayingTabId);
      const sendEnter = async (nodeId) => {
        await connection.sendCommand("DOM.focus", { nodeId });
        await connection.sendCommand("Input.dispatchKeyEvent", {
          type: "keyDown",
          keyCode: 13,
          key: "Enter",
          code: "Enter",
          text: "\r"
        });
        await connection.sendCommand("Input.dispatchKeyEvent", {
          type: "keyDown",
          keyCode: 13,
          key: "Enter",
          code: "Enter",
          text: "\r"
        });
      };
      try {
        await connection.attach();
        const docNode = await connection.getDocument();
        const selector = await this.convertToQuerySelector(locator);
        const nodeId = await connection.querySelector(selector, docNode.nodeId);
        const parts = value.split("${KEY_ENTER}");
        let n = 0;
        while (n < parts.length) {
          const part = parts[n];
          if (part) {
            await this.sendMessage("sendKeys", locator, value, top);
          }
          if (n < parts.length - 1) {
            await sendEnter(nodeId);
          }
          n++;
        }
        await connection.detach();
        return {
          result: "success"
        };
      } catch (e) {
        await connection.detach();
        throw e;
      }
    } else {
      return this.sendMessage("sendKeys", locator, value, top);
    }
  }

  doStore(string, varName) {
    variables.set(varName, string);
    return Promise.resolve();
  }

  doSetSpeed(speed) {
    if (speed < 0) speed = 0;
    if (speed > PlaybackState.maxDelay) speed = PlaybackState.maxDelay;

    PlaybackState.setDelay(speed);
    return Promise.resolve();
  }

  async convertToQuerySelector(locator) {
    let querySelector;
    try {
      querySelector = convertLocator(locator);
    } catch (e) {
      try {
        const locators = await this.buildLocators(locator);
        for (let loc of locators) {
          try {
            querySelector = convertLocator(loc[0]);
            break;
          } catch (err) {} // eslint-disable-line
        }
      } catch (err) {
        throw e;
      }
    }

    return querySelector;
  }

  async buildLocators(locator) {
    const { locators } = await this.sendPayload({
      buildLocators: true,
      locator
    });
    return locators;
  }

  wait(...properties) {
    if (!properties.length)
      return Promise.reject("No arguments");
    let self = this;
    let ref = this;
    let inspecting = properties[properties.length - 1];
    for (let i = 0; i < properties.length - 1; i++) {
      if (!ref[properties[i]] | !(ref[properties[i]] instanceof Array | ref[properties[i]] instanceof Object))
        return Promise.reject("Invalid Argument");
      ref = ref[properties[i]];
    }
    return new Promise(function(resolve, reject) {
      let counter = 0;
      let interval = setInterval(function() {
        if (ref[inspecting] === undefined || ref[inspecting] === false) {
          counter++;
          if (counter > self.waitTimes) {
            reject("Timeout");
            clearInterval(interval);
          }
        } else {
          resolve();
          clearInterval(interval);
        }
      }, self.waitInterval);
    });
  }

  async attachToRecordingWindow(testCaseId) {
    if (this.windowSession.currentRecordingWindowId[testCaseId]) {
      const tabs = await browser.tabs.query({
        windowId: this.windowSession.currentRecordingWindowId[testCaseId]
      });
      await this.attachToTab(tabs[0].id);
    } else {
      throw new Error("No matching window found");
    }
  }

  async updateOrCreateTab() {
    if (!this.windowSession.generalUsePlayingWindowId) {
      await this.createPlaybackWindow();
    } else {
      try {
        const tabs = await browser.tabs.query({
          windowId: this.windowSession.generalUsePlayingWindowId
        });
        await this.attachToTab(tabs[0].id);
      } catch(e) {
        await this.createPlaybackWindow();
      }
    }
  }

  async attachToTab(tabId) {
    const tab = await browser.tabs.update(tabId, {
      url: browser.runtime.getURL("/bootstrap.html")
    });
    await browser.windows.update(tab.windowId, {
      focused: true
    });
    await this.wait("playingTabStatus", tab.id);
    // Firefox did not update url information when tab is updated
    // We assign url manually and go to set first tab
    tab.url = browser.runtime.getURL("/bootstrap.html");
    this.setFirstTab(tab);
  }

  async createPlaybackWindow() {
    const win = await browser.windows.create({
      url: browser.runtime.getURL("/bootstrap.html")
    });
    this.setFirstTab(win.tabs[0]);
    this.windowSession.generalUsePlayingWindowId = win.id;
    this.windowSession.setOpenedWindow(win.id);
    const backgroundWindow = await browser.runtime.getBackgroundPage();
    backgroundWindow.master[win.id] = this.windowSession.ideWindowId;
  }

  setFirstTab(tab) {
    this.currentPlayingWindowId = tab.windowId;
    this.currentPlayingTabId = tab.id;
    this.playingTabNames["win_ser_local"] = this.currentPlayingTabId;
    this.playingTabIds[this.currentPlayingTabId] = "win_ser_local";
    this.playingFrameLocations[this.currentPlayingTabId] = {};
    this.playingFrameLocations[this.currentPlayingTabId]["root"] = 0;
    // we assume that there has an "open" command
    // select Frame directly will cause failed
    this.playingTabStatus[this.currentPlayingTabId] = true;
  }

  isAddOnPage(url) {
    if (url.startsWith("https://addons.mozilla.org") ||
      url.startsWith("https://chrome.google.com/webstore")) {
      return true;
    }
    return false;
  }

  name(command) {
    let upperCase = command.charAt(0).toUpperCase() + command.slice(1);
    return "do" + upperCase;
  }

  isExtCommand(command) {
    switch(command) {
      case "pause":
      case "open":
      case "selectFrame":
      case "selectWindow":
      case "run":
      case "setSpeed":
      case "store":
      case "close":
        return true;
      default:
        return false;
    }
  }

  isWindowMethodCommand(command) {
    return (command == "answerOnNextPrompt"
      || command == "chooseCancelOnNextPrompt"
      || command == "assertPrompt"
      || command == "chooseOkOnNextConfirmation"
      || command == "chooseCancelOnNextConfirmation"
      || command == "assertConfirmation"
      || command == "assertAlert");
  }
}
