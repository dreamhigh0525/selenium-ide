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

import fs from "fs";
import path from "path";
import Capabilities from "../capabilities";

describe("capabilities yaml parser", () => {
  it("should parse yaml capabilities", () => {
    const capabilities = fs.readFileSync(path.join(__dirname, "capabilities_1.yml"));
    expect(Capabilities.parseYaml(capabilities)).toEqual({
      browserName: "chrome",
      platform: "MAC",
      unexpectedAlertBehaviour: "ignore"
    });
  });
});

describe("capabilities string parser", () => {
  it("should parse capability key", () => {
    const capabilities = "browserName=chrome";
    expect(Capabilities.parseString(capabilities)).toEqual({
      browserName: "chrome"
    });
  });
  it("should parse multiple capabilities keys", () => {
    const capabilities = "browserName=chrome platform=MAC unexpectedAlertBehaviour=ignore";
    expect(Capabilities.parseString(capabilities)).toEqual({
      browserName: "chrome",
      platform: "MAC",
      unexpectedAlertBehaviour: "ignore"
    });
  });
  it("should parse quoted capability key", () => {
    const capabilities = "browserName=\"chrome\"";
    expect(Capabilities.parseString(capabilities)).toEqual({
      browserName: "chrome"
    });
  });
  it("should parse multiword capability key", () => {
    const capabilities = "binary=\"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome\"";
    expect(Capabilities.parseString(capabilities)).toEqual({
      binary: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
    });
  });
  it("should parse boolean capability key", () => {
    const capabilities = "javascriptEnabled=false databaseEnabled=true";
    expect(Capabilities.parseString(capabilities)).toEqual({
      javascriptEnabled: false,
      databaseEnabled: true
    });
  });
  it("should parse integer capability key", () => {
    const capabilities = "elementScrollBehavior=1";
    expect(Capabilities.parseString(capabilities)).toEqual({
      elementScrollBehavior: 1
    });
  });
  it("should parse dot-notation capability key", () => {
    const capabilities = "webdriver.remote.sessionid=someId";
    expect(Capabilities.parseString(capabilities)).toEqual({
      webdriver: {
        remote: {
          sessionid: "someId"
        }
      }
    });
  });
  it("should parse space separated capability keys", () => {
    const capabilities = "browserName =chrome platform= MAC unexpectedAlertBehaviour = ignore";
    expect(Capabilities.parseString(capabilities)).toEqual({
      browserName: "chrome",
      platform: "MAC",
      unexpectedAlertBehaviour: "ignore"
    });
  });
});
