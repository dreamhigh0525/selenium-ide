import React from "react";
import PropTypes from "prop-types";
import Dropzone from "react-dropzone";

export default class SuiteDropzone extends React.Component {
  static propTypes = {
    children: PropTypes.node,
    loadProject: PropTypes.func
  };
  onDrop(blobs) {
    this.props.loadProject(blobs[0]);
  }
  render() {
    return (
      <Dropzone className="suite-dropzone" acceptClassName="accept" accept=".side" onDrop={this.onDrop.bind(this)}>
        {this.props.children}
      </Dropzone>
    );
  }
}
