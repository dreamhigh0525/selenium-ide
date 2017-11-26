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
import classNames from "classnames";
import Title from "react-document-title";
import ContentEditable from "react-contenteditable";
import OpenButton from "../ActionButtons/Open";
import SaveButton from "../ActionButtons/Save";
import "./style.css";

export default class ProjectHeader extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }
  static propTypes = {
    title: PropTypes.string.isRequired,
    changed: PropTypes.bool,
    changeName: PropTypes.func.isRequired,
    load: PropTypes.func,
    save: PropTypes.func
  };
  handleChange(e) {
    this.props.changeName(e.target.value);
  }
  render() {
    return (
      <div className="header">
        <Title title={`Selenium IDE - ${this.props.title}${this.props.changed ? "*" : ""}`} />
        <ContentEditable className={classNames("title", {"changed": this.props.changed})} onChange={this.handleChange} html={this.props.title} />
        <span className="buttons right">
          <OpenButton onFileSelected={this.props.load} />
          <SaveButton onClick={this.props.save} />
        </span>
      </div>
    );
  }
}
