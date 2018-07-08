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

import TestCaseEmitter from "../src/testcase";
import SuiteEmitter from "../src/suite";

describe("suite emitter", () => {
  it("should emit an empty suite", () => {
    const suite = {
      id: "1",
      name: "example suite",
      timeout: "30",
      tests: []
    };
    return expect(SuiteEmitter.emit(suite, {})).resolves.toBe(`jest.setTimeout(30000);describe("${suite.name}", () => {});`);
  });
  it("should emit a suite with a single empty test", async () => {
    const tests = {
      "1": {
        id: "1",
        name: "example test case",
        commands: []
      }
    };
    const suite = {
      id: "1",
      name: "example suite",
      timeout: "30",
      tests: ["1"]
    };
    return expect(SuiteEmitter.emit(suite, {
      1: await TestCaseEmitter.emit(tests["1"])
    })).resolves.toBe(`jest.setTimeout(30000);describe("${suite.name}", () => {it("${tests["1"].name}", async () => {await tests.example_test_case(driver, vars);await driver.getTitle().then(title => {expect(title).toBeDefined();});});});`);
  });
  it("should emit a suite with multiple empty tests", async () => {
    const tests = {
      "1": {
        id: "1",
        name: "example test case",
        commands: []
      },
      "2": {
        id: "2",
        name: "second test case",
        commands: []
      },
      "3": {
        id: "3",
        name: "third test case",
        commands: []
      }
    };
    const suite = {
      id: "1",
      name: "example suite",
      timeout: "30",
      tests: ["1", "2", "3"]
    };
    return expect(SuiteEmitter.emit(suite, {
      1: await TestCaseEmitter.emit(tests["1"]),
      2: await TestCaseEmitter.emit(tests["2"]),
      3: await TestCaseEmitter.emit(tests["3"])
    })).resolves.toBe(`jest.setTimeout(30000);describe("${suite.name}", () => {it("${tests["1"].name}", async () => {await tests.example_test_case(driver, vars);await driver.getTitle().then(title => {expect(title).toBeDefined();});});it("${tests["2"].name}", async () => {await tests.second_test_case(driver, vars);await driver.getTitle().then(title => {expect(title).toBeDefined();});});it("${tests["3"].name}", async () => {await tests.third_test_case(driver, vars);await driver.getTitle().then(title => {expect(title).toBeDefined();});});});`);
  });
  it("should emit a parallel suite", async () => {
    const tests = {
      "1": {
        id: "1",
        name: "example test case",
        commands: []
      },
      "2": {
        id: "2",
        name: "second test case",
        commands: []
      },
      "3": {
        id: "3",
        name: "third test case",
        commands: []
      }
    };
    const suite = {
      id: "1",
      name: "example suite",
      timeout: "30",
      parallel: true,
      tests: ["1", "2", "3"]
    };
    return expect(SuiteEmitter.emit(suite, {
      1: await TestCaseEmitter.emit(tests["1"]),
      2: await TestCaseEmitter.emit(tests["2"]),
      3: await TestCaseEmitter.emit(tests["3"])
    })).resolves.toEqual([
      {
        name: tests["1"].name,
        code: `jest.setTimeout(30000);test("${tests["1"].name}", async () => {await tests.example_test_case(driver, vars);await driver.getTitle().then(title => {expect(title).toBeDefined();});});`
      },
      {
        name: tests["2"].name,
        code: `jest.setTimeout(30000);test("${tests["2"].name}", async () => {await tests.second_test_case(driver, vars);await driver.getTitle().then(title => {expect(title).toBeDefined();});});`
      },
      {
        name: tests["3"].name,
        code: `jest.setTimeout(30000);test("${tests["3"].name}", async () => {await tests.third_test_case(driver, vars);await driver.getTitle().then(title => {expect(title).toBeDefined();});});`
      }]);
  });
});
