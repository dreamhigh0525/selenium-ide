/*
 * Copyright 2017 SideeX committers
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 */

import browser from "webextension-polyfill";

let extensionWindow = undefined;
let panelId = undefined;

function browserAction() {
  if (extensionWindow) {
    browser.windows.update(extensionWindow.id, {
      focused: true
    }).catch(openPage);
  } else {
    openPage();
  }
}

function openPage() {
  const getContentWindowInfo = browser.windows.getLastFocused();
  const getSideexWindowInfo = openWindowFromStorageResolution();

  Promise.all([getContentWindowInfo, getSideexWindowInfo])
    .then(function(windowInfo) {
      console.log("get the window info");
      let contentWindowInfo = windowInfo[0];
      let sideexWindowInfo = extensionWindow = windowInfo[1];
      console.log("contentWindowInfo Id:" + contentWindowInfo.id);
      console.log("contentWindowInfo:", contentWindowInfo);
      console.log("sideexWindowInfo Id:" + sideexWindowInfo.id);
      console.log("sideexWindowInfo:", sideexWindowInfo);
      return new Promise(function(resolve, reject) {
        let count = 0;
        let interval = setInterval(function() {
          if (count > 100) {
            reject("SideeX editor has no response");
            clearInterval(interval);
          }

          browser.tabs.query({
            active: true,
            windowId: sideexWindowInfo.id
          }).then(function(tabs) {
            if (tabs.length != 1) {
              count++;
              return;
            }
            let sideexTabInfo = tabs[0];
            if (sideexTabInfo.status == "loading") {
              count++;
              return;
            } else {
              console.log("SideeX has been fully loaded");
              resolve(windowInfo);
              clearInterval(interval);
            }
          });
        }, 200);
      });
    }).then(passWindowId)
    .catch(function(e) {
      console.error(e);
    });
}

function openWindowFromStorageResolution() {
  let size = {
    height: 690,
    width: 550
  };
  return browser.storage.local.get().then(storage => {
    if (sizeIsValid(storage.size)) {
      size.height = storage.size.height;
      size.width = storage.size.width;
    }
    return browser.windows.create(Object.assign({
      url: browser.extension.getURL("assets/index.html"),
      type: "popup"
    }, size));
  }).catch(e => {
    console.error(e);
    return browser.windows.create(Object.assign({
      url: browser.extension.getURL("assets/index.html"),
      type: "popup"
    }, size));
  });
}

function sizeIsValid(size) {
  return (size && sideIsValid(size.height) && sideIsValid(size.width));
}

function sideIsValid(number) {
  return number && number.constructor.name === "Number" && number > 50;
}

browser.browserAction.onClicked.addListener(browserAction);

function disconnectAllTabs(tabs) {
  for (let tab of tabs) {
    browser.tabs.sendMessage(tab.id, { active: false });
  }
}

function queryError(error) {
  console.error(`Error: ${error}`);
}

browser.windows.onRemoved.addListener(function(windowId) {
  if (windowId === panelId) {
    console.log("Editor has closed");
    const querying = browser.tabs.query({ url: "<all_urls>" });
    querying.then(disconnectAllTabs, queryError);
    panelId = undefined;
  }

  browser.contextMenus.removeAll();
});

function passWindowId(windowInfo){
  let contentWindowInfo = windowInfo[0];
  let sideexWindowInfo = windowInfo[1];
  let contentWindowId = contentWindowInfo.id;
  let sideexTabId = sideexWindowInfo.tabs[0].id;
  let sideexWindowId = sideexWindowInfo.id;

  return browser.tabs.sendMessage(sideexTabId, {
    selfWindowId: sideexWindowId,
    commWindowId: contentWindowId
  });
}

let port;
browser.contextMenus.onClicked.addListener(function(info) {
  port.postMessage({ cmd: info.menuItemId });
});

browser.runtime.onConnect.addListener(function(m) {
  port = m;
});

browser.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  browser.runtime.sendMessage(message).then(sendResponse).catch(() => {
    return sendResponse({ error: "Selenium IDE is not active" });
  });
  return true;
});
