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

import Command from "../../../models/Command";
import { CommandNode } from "../../../playback/playback-tree/command-node";

describe("Command Node", () => {
  it("control flow check returns correct result", () => {
    let command = new Command(undefined, "if", "", "");
    let node = new CommandNode(command);
    expect(node.isControlFlow()).toBeTruthy();
    command = new Command(undefined, "command", "", "");
    node = new CommandNode(command);
    node.left = "asdf";
    expect(node.isControlFlow()).toBeTruthy();
    command = new Command(undefined, "command", "", "");
    node = new CommandNode(command);
    node.right = "asdf";
    expect(node.isControlFlow()).toBeTruthy();
  });
  it("retry limit defaults to 1000", () => {
    const command = new Command(undefined, "command", "", "");
    const node = new CommandNode(command);
    node.timesVisited = 999;
    expect(node._isRetryLimit()).toBeFalsy();
    node.timesVisited = 1000;
    expect(node._isRetryLimit()).toBeTruthy();
  });

  it("retry limit can be overriden", () => {
    const command = new Command(undefined, "command", "", 5);
    const node = new CommandNode(command);
    node.timesVisited = 5;
    expect(node._isRetryLimit()).toBeTruthy();
  });
  it("resolves with an error message when too many retries attempted in a loop", () => {
    const command = new Command(undefined, "command", "", 2);
    const node = new CommandNode(command);
    node.timesVisited = 3;
    node.execute().then((result) => {
      expect(result.result).toEqual("Max retry limit exceeded. To override it, specify a new limit in the value input field.");
    });
  });
  it("resolves with an error message on 'times' when an invalid number is provided", () => {
    const command = new Command(undefined, "times", "asdf", "");
    const node = new CommandNode(command);
    node._evaluate().then((result) => {
      expect(result.result).toEqual("Invalid number provided as a target.");
    });
  });

});
