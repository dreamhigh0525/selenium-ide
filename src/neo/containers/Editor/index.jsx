import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import UiState from "../../stores/view/UiState";
import ToolBar from "../../components/ToolBar";
import UrlBar from "../../components/UrlBar";
import TestTable from "../../components/TestTable";
import CommandForm from "../../components/CommandForm";

@observer export default class Editor extends React.Component {
  constructor(props) {
    super(props);
    this.addCommand = this.addCommand.bind(this);
    this.removeCommand = this.removeCommand.bind(this);
  }
  static propTypes = {
    test: PropTypes.object
  };
  addCommand(index) {
    const command = this.props.test.createCommand(index + 1);
    command.setCommand("open");
    UiState.selectCommand(command);
  }
  removeCommand(command) {
    if (UiState.selectedCommand === command) {
      UiState.selectCommand(null);
    }
    this.props.test.removeCommand(command);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.test && this.props.test !== nextProps.test) {
      UiState.selectCommand(null);
    }
  }
  render() {
    return (
      <main style={{
        display: "flow-root"
      }}>
        <ToolBar />
        <UrlBar />
        <TestTable
          commands={this.props.test ? this.props.test.commands : null}
          selectedCommand={UiState.selectedCommand ? UiState.selectedCommand.id : null}
          selectCommand={UiState.selectCommand}
          addCommand={this.addCommand}
          removeCommand={this.removeCommand}
          swapCommands={this.props.test ? this.props.test.swapCommands : null}
        />
        <CommandForm command={UiState.selectedCommand}
          setCommand={this.handleCommandChange}
        />
      </main>
    );
  }
}
