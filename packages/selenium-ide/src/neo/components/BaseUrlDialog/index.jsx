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
import DialogContainer from "../DialogContainer";
import LabelledInput from "../LabelledInput";
import FlatButton from "../FlatButton";

export default class BaseUrlDialog extends React.Component {
  static propTypes = {
    isSelectingUrl: PropTypes.bool
  };
  render() {
    return (
      <Modal className="stripped" isOpen={this.props.isSelectingUrl}>
        <BaseUrlDialogContents {...this.props} />
      </Modal>
    );
  }
}

class BaseUrlDialogContents extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: ""
    };
    this.urlRegex = /^https?:\/\//;
    this.onUrlChange = this.onUrlChange.bind(this);
  }
  static propTypes = {
    onUrlSelection: PropTypes.func
  };
  onUrlChange(url) {
    this.setState({ url });
  }
  render() {
    return (
      <DialogContainer
        title="Project base URL is missing or invalid!"
        type="warn"
        renderFooter={() => (
          <FlatButton
            type="submit"
            disabled={!this.urlRegex.test(this.state.url)}
            onClick={() => {this.props.onUrlSelection(this.state.url);}}
            style={{
              margin: 0,
              float: "right"
            }}
          >Start recording</FlatButton>
        )}
      >
        <p>
          Before you can start recording, you must specify a valid base URL for your project. Your tests will start by navigating
          to this URL.
        </p>
        <LabelledInput
          name="baseUrl"
          label="base url"
          placeholder="https://www.seleniumhq.org/"
          value={this.state.url}
          onChange={this.onUrlChange}
        />
      </DialogContainer>
    );
  }
}
