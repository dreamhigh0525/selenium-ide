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

import { RegisterConfigurationHook, RegisterSuiteHook, RegisterTestHook, RegisterEmitter } from "selianize";
import { Commands } from "../neo/models/Command";
import { registerCommand } from "./commandExecutor";
import { sendMessage } from "./communication";

const TIMEOUT = 5000;

function RunCommand(id, command, target, value, options) {
  return sendMessage(id, {
    action: "execute",
    command: {
      command,
      target,
      value
    },
    options
  });
}

class PluginManager {
  constructor() {
    this.plugins = [];
    RegisterConfigurationHook((project) => {
      return new Promise((res) => {
        Promise.all(this.plugins.map(plugin => this.emitConfiguration(plugin, project).catch((e) => {console.log(e); return "";}))).then(configs => (
          res(configs.join(""))
        ));
      });
    });
  }

  registerPlugin(plugin) {
    if (!this.hasPlugin(plugin.id)) {
      plugin.canEmit = false;
      this.plugins.push(plugin);
      RegisterSuiteHook(this.emitSuite.bind(undefined, plugin));
      RegisterTestHook(this.emitTest.bind(undefined, plugin));
      if (plugin.commands) {
        plugin.commands.forEach(({ id, name, type, docs }) => {
          Commands.addCommand(id, { name, type, ...docs });
          registerCommand(id, RunCommand.bind(undefined, plugin.id, id));
          RegisterEmitter(id, this.emitCommand.bind(undefined, plugin, id));
        });
      }
    } else {
      throw new Error("This plugin is already registered");
    }
  }

  hasPlugin(pluginId) {
    return !!this.plugins.find(p => p.id === pluginId);
  }

  getPlugin(pluginId) {
    return this.plugins.find(p => p.id === pluginId);
  }

  validatePluginExport(project) {
    function validatePlugin(plugin) {
      return sendMessage(plugin.id, {
        action: "emit",
        entity: "project",
        project
      }).catch(() => (false)).then(({ canEmit }) => {
        plugin.canEmit = canEmit;
        return plugin;
      });
    }
    return Promise.all(this.plugins.map((plugin) => (validatePlugin(plugin))));
  }

  // IMPORTANT: call this function only after calling validatePluginExport!!
  emitDependencies() {
    let dependencies = {};
    let plugins = this.plugins.filter(plugin => plugin.canEmit).map(plugin => {
      Object.assign(dependencies, plugin.dependencies);
      return {
        id: plugin.id,
        name: plugin.name,
        version: plugin.version
      };
    });

    return { plugins, dependencies };
  }

  emitConfiguration(plugin, project) {
    if (plugin.canEmit) {
      return sendMessage(plugin.id, {
        action: "emit",
        entity: "config",
        project
      }).then(res => res.message);
    } else {
      return Promise.resolve("");
    }
  }

  emitSuite(plugin, suiteInfo) {
    if (plugin.canEmit) {
      return sendMessage(plugin.id, {
        action: "emit",
        entity: "suite",
        suite: suiteInfo
      }).catch(() => ({}));
    } else {
      return Promise.resolve({});
    }
  }

  emitTest(plugin, test) {
    if (plugin.canEmit) {
      return sendMessage(plugin.id, {
        action: "emit",
        entity: "test",
        test
      }).catch(() => ({}));
    } else {
      return Promise.resolve({});
    }
  }

  emitCommand(plugin, command, target, value) {
    // no need to check emission as it is be unreachable, in case a project can't emit
    return sendMessage(plugin.id, {
      action: "emit",
      entity: "command",
      command: {
        command,
        target,
        value
      }
    }).then(res => res.message);
  }

  emitMessage(message, keepAliveCB) {
    return Promise.all(this.plugins.map(plugin => {
      let didReachTimeout = false;
      const emitInterval = setInterval(() => {
        didReachTimeout = true;
        keepAliveCB(plugin);
      }, TIMEOUT);
      return sendMessage(plugin.id, message).catch((err) => (Promise.resolve(err))).then(r => {
        clearInterval(emitInterval);
        if (didReachTimeout) {
          keepAliveCB(plugin, true);
        }
        return r;
      });
    }));
  }
}

export default new PluginManager();
