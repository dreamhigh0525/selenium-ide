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

import { js_beautify as beautify } from "js-beautify";
import template from "./template";
import SuiteEmitter from "./suite";

export default function Selianize(project) {
  return new Promise(async (res, rej) => { // eslint-disable-line no-unused-vars
    let result = template.bootstrap();

    const testsHashmap = project.tests.reduce((map, test) => {
      map[test.id] = test;
      return map;
    }, {});
    let errors = [];
    result += (await Promise.all(project.suites.map((suite) => SuiteEmitter.emit(suite, testsHashmap).catch(e => {
      errors.push(e);
    })))).join("");

    errors.length ? rej({ name: project.name, suites: errors }) : res(beautify(result, { indent_size: 2 }));
  });
}
