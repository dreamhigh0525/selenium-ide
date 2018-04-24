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
import { DEFAULT_TIMEOUT } from "../../models/Suite";
import Modal from "../Modal";
import ModalHeader from "../ModalHeader";
import Input from "../FormInput";
import FlatButton from "../FlatButton";
import Checkbox from "../Checkbox";

export default class SuiteSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeout: props.timeout ? props.timeout : "",
      isParallel: !!props.isParallel
    };
  }
  static propTypes = {
    isEditing: PropTypes.bool,
    timeout: PropTypes.number,
    isParallel: PropTypes.bool,
    submit: PropTypes.func,
    cancel: PropTypes.func
  };
  componentWillReceiveProps(nextProps) {
    if (!this.props.isEditing && nextProps.isEditing) {
      this.setState({
        timeout: nextProps.timeout,
        isParallel: nextProps.isParallel
      });
    }
  }
  onTimeoutChange(value) {
    this.setState({
      timeout: value
    });
  }
  onIsParallelChange(e) {
    this.setState({
      isParallel: e.target.checked
    });
  }
  render() {
    return (
      <Modal className="suite-settings-dialog" isOpen={this.props.isEditing} onRequestClose={this.props.cancel}>
        <form onSubmit={(e) => { e.preventDefault(); }} style={{
          minWidth: "300px"
        }}>
          <ModalHeader title="Suite properties" close={this.props.cancel} />
          <div className="form-contents">
            <Input name="suite-timeout" type="number" label="Timeout (seconds)" placeholder={DEFAULT_TIMEOUT} value={this.state.timeout} width={130} onChange={this.onTimeoutChange.bind(this)} />
            <Checkbox label="Run in parallel" checked={this.state.isParallel} width={130} onChange={this.onIsParallelChange.bind(this)} />
          </div>
          <span className="right">
            <FlatButton onClick={this.props.cancel}>Cancel</FlatButton>
            <FlatButton type="submit" onClick={() => {this.props.submit({timeout: parseInt(this.state.timeout) || DEFAULT_TIMEOUT, isParallel: this.state.isParallel});}} style={{
              marginRight: "0"
            }}>Submit</FlatButton>
          </span>
          <div className="clear"></div>
        </form>
      </Modal>
    );
  }
}
