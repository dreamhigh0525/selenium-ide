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
import { observer } from "mobx-react";
import "./style.css";


          //{ Array.from(this.props.selectedCommand.arguments).map((argument) => <li>{argument}</li>) }
@observer
export default class CommandReference extends React.Component {
  render() {
    return (
      <div className="command-reference">
        <ul>
          { this.props.selectedCommand.name &&
            <li className="name">
              {this.props.selectedCommand.name}&nbsp;
              {this.props.selectedCommand.target && <em>{this.props.selectedCommand.target.name}</em>}
              {this.props.selectedCommand.value && <em>, {this.props.selectedCommand.value.name}</em>}
            </li> }
          { this.props.selectedCommand.description && <li className="description">{this.props.selectedCommand.description}</li> }
          <br />
          <li>arguments:</li>
          { this.props.selectedCommand.target &&
            <li className="argument">{this.props.selectedCommand.target.name} - {this.props.selectedCommand.target.value}</li> }
        </ul>
      </div>
    );
  }
}
