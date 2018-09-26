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
import Modal from "../Modal";
import FlatButton from "../FlatButton";
import LabelledInput from "../LabelledInput";
import DialogContainer from "../DialogContainer";
import classNames from "classnames";
import "./style.css";

export default class RenameDialog extends React.Component {
  static propTypes = {
    isEditing: PropTypes.bool,
    type: PropTypes.string,
    value: PropTypes.string,
    verify: PropTypes.func,
    cancel: PropTypes.func,
    setValue: PropTypes.func
  };
  render() {
    return (
      <Modal className={classNames("stripped", "rename-dialog")} isOpen={this.props.isEditing} onRequestClose={this.props.cancel}>
        <RenameDialogContents {...this.props} />
      </Modal>
    );
  }
}

class RenameDialogContents extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isRenaming: !!props.value,
      value: props.value ? props.value : "",
      valid: true,
      type: props.type
    };
  }
  handleChange(inputValue) {
    this.setState({
      value: inputValue,
      valid: this.props.verify(inputValue)
    });
  }
  render() {
    const content = {
      title: this.props.isNewTest ? "Name your new test" : `${this.state.isRenaming ? "Rename" : "Add new"} ${this.state.type}`,
      submitButton: this.props.isNewTest ? "OK" : (this.state.isRenaming ? "Rename" : "Add"),
      cancelButton: this.props.isNewTest ? "LATER" : "Cancel",
      inputLabel: this.props.isNewTest ? "test name" : this.state.type
    };
    return (
      <DialogContainer
        title={content.title}
        type={this.state.valid ? "info" : "warn"}
        renderFooter={() => (
          <span className="right">
            <FlatButton onClick={this.props.cancel}>{content.cancelButton}</FlatButton>
            <FlatButton type="submit" disabled={!this.state.value || !this.state.valid} onClick={() => {this.props.setValue(this.state.value);}} style={{
              marginRight: "0"
            }}>{content.submitButton}</FlatButton>
          </span>
        )}
        onRequestClose={this.props.cancel}
      >
        { this.props.isNewTest &&
            <p>Please provide a name for your new test. You can change it at any time by clicking the <span className={classNames("si-more", "more-icon")}/> icon next to its name.</p> }
        <LabelledInput
          name={this.state.type + "Name"}
          label={content.inputLabel}
          value={this.state.value}
          onChange={this.handleChange.bind(this)}
          autoFocus
        />
        { !this.state.valid && <span className="message">A {this.props.type} with this name already exists</span> }
      </DialogContainer>
    );
  }
  static propTypes = {
    isEditing: PropTypes.bool,
    type: PropTypes.string,
    value: PropTypes.string,
    verify: PropTypes.func,
    cancel: PropTypes.func,
    setValue: PropTypes.func,
    isNewTest: PropTypes.bool
  };
}
