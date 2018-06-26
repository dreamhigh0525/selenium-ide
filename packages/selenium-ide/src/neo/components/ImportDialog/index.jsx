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
import Dropzone from "react-dropzone";
import classNames from "classnames";
import Modal from "../Modal";
import ModalHeader from "../ModalHeader";
import FlatButton from "../FlatButton";
import { parseSuiteRequirements } from "../../IO/legacy/migrate";
import { loadAsText } from "../../IO/filesystem";
import HtmlFile from "../../assets/images/html_file.png";
import "./style.css";

export default class ImportDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  static propTypes = {
    isImporting: PropTypes.bool.isRequired,
    cancel: PropTypes.func.isRequired,
    suite: PropTypes.string,
    onComplete: PropTypes.func
  };
  componentWillReceiveProps(nextProps) {
    if (this.props.suite !== nextProps.suite) {
      this.setState({
        files: parseSuiteRequirements(nextProps.suite).map(name => ({ name }))
      });
    }
  }
  onDrop(blobs) {
    Promise.all(this.state.files.map((file) => {
      // Dont load files we dont need
      const blob = blobs.find(({ name }) => {
        return file.name.includes(name);
      });
      if (blob) {
        return loadAsText(blob).then(contents => {
          file.contents = contents;
          return file;
        });
      }
      return Promise.resolve(file);
    }, [])).then((files) => {
      this.setState({ files }, () => {
        // check if all files have been uploaded
        if (!this.state.files.find((file) => !file.contents)) {
          this.props.onComplete(this.state.files);
        }
      });
    });
  }
  render() {
    return (
      <Modal className="import-dialog" isOpen={this.props.isImporting} onRequestClose={this.props.cancel}>
        <form onSubmit={(e) => { e.preventDefault(); }}>
          <ModalHeader title="Import suite" close={this.props.cancel} />
          <p>In order to fully import your legacy Selenium IDE suite, you need to individually import the following tests
          </p>
          <Dropzone className="dropzone" acceptClassName="accept" rejectClassName="reject" accept="text/html" onDropAccepted={this.onDrop.bind(this)}>
            <div>
              <div className="file-icon">
                <img alt="html file" height="50" src={HtmlFile} />
                <p>
                  Drop files here, or{" "}
                  <a className="link" href="#">browse</a>
                </p>
              </div>
            </div>
          </Dropzone>
          <ul>
            {this.state.files && this.state.files.map(({ name, contents }) => (
              <li key={name} className={classNames({ accepted: !!contents })}>{name}</li>
            ))}
          </ul>
          <hr />
          <span className="right">
            <FlatButton onClick={this.props.cancel}>Cancel</FlatButton>
          </span>
          <div className="clear"></div>
        </form>
      </Modal>
    );
  }
}
