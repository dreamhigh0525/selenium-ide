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

import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import classNames from "classnames";
import Linkify from "react-linkify";
import { LogTypes } from "../../ui-models/Log";
import "./style.css";

@observer
export default class LogMessage extends React.Component {
  render() {
    let statusMessage = "";
    if (this.props.log.status && !this.props.log.isNotice) {
      if (this.props.log.status === LogTypes.Success) {
        statusMessage = "Success";
      } else if (this.props.log.status === LogTypes.Error) {
        statusMessage = `Failed${this.props.log.error ? ":" : ""}`;
      }
    }
    return (
      <li className={classNames("log", this.props.log.status, {notice: this.props.log.isNotice})}>
        {this.props.log.index && <span className="index">{this.props.log.index}.</span>}
        <span className="message">{this.props.log.message}<span className="status"> {statusMessage}</span></span>
        {this.props.log.error && <div className="error-message"><Linkify properties={{
          target: "_blank"
        }}>{this.props.log.error}</Linkify></div>}
      </li>
    );
  }
  static propTypes = {
    log: PropTypes.object
  };
}
