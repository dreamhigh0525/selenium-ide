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

import { Commands, ArgTypes } from '@seleniumhq/side-model'

export default function migrate(project) {
  let r = Object.assign({}, project)
  r.tests = r.tests.map(test => {
    return Object.assign({}, test, {
      commands: test.commands.map(c => {
        if (Commands[c.command]) {
          let newCmd = Object.assign({}, c)
          const type = Commands[c.command]
          if (
            type.target &&
            (type.target.name === ArgTypes.script.name ||
              type.target.name === ArgTypes.conditionalExpression.name)
          ) {
            newCmd.target = migrateScript(newCmd.target)
          }
          return newCmd
        }
        return c
      }),
    })
  })
  return r
}

function migrateScript(script) {
  return script
    .replace(/'\$\{(\w+)\}'/g, '${$1}')
    .replace(/`\$\{(\w+)\}`/g, '${$1}')
    .replace(/"\$\{(\w+)\}"/g, '${$1}')
}

migrate.version = '1.1'
