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

import Router from "../../router";
import Manager from "../../plugin/manager";
import playbackRouter from "./playback";
import recordRouter from "./record";
import exportRouter from "./export";
import popupRouter from "./popup";

const router = new Router();

router.get("/health", (req, res) => {
  res(Manager.hasPlugin(req.sender));
});

router.post("/register", (req, res) => {
  const plugin = {
    id: req.sender,
    name: req.name,
    version: req.version,
    commands: req.commands,
    dependencies: req.dependencies
  };
  Manager.registerPlugin(plugin);
  res(true);
});

router.use("/playback", playbackRouter);
router.use("/record", recordRouter);
router.use("/export", exportRouter);
router.use("/popup", popupRouter);

export default router;
