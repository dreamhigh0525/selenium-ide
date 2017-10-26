import React from "react";
import PropTypes from "prop-types";
import { observer } from "mobx-react";
import { PropTypes as MobxPropTypes } from "mobx-react";
import UiState from "../../stores/view/UiState";
import TabBar from "../../components/TabBar";
import SearchBar from "../../components/SearchBar";
import TestList from "../../components/TestList";
import SuiteList from "../../components/SuiteList";
import Runs from "../../components/Runs";
import "./style.css";

@observer export default class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showTests: true
    };
    this.handleChangedTab = this.handleChangedTab.bind(this);
  }
  static propTypes = {
    suites: MobxPropTypes.arrayOrObservableArray.isRequired,
    tests: MobxPropTypes.arrayOrObservableArray.isRequired,
    removeSuite: PropTypes.func.isRequired,
    moveTest: PropTypes.func.isRequired,
    deleteTest: PropTypes.func.isRequired
  };
  handleChangedTab(tab) {
    this.setState({
      showTests: tab === "Tests"
    });
  }
  render() {
    return (
      <aside className="test-cases" style={{
        maxWidth: "200px"
      }}>
        <TabBar tabs={["Tests", "Suites"]} tabChanged={this.handleChangedTab} />
        <SearchBar filter={UiState.changeFilter} />
        { this.state.showTests
          ? <TestList tests={this.props.tests} removeTest={this.props.deleteTest} />
          : <SuiteList suites={this.props.suites} selectTests={UiState.editSuite} removeSuite={this.props.removeSuite} moveTest={this.props.moveTest} /> }
        <Runs />
      </aside>
    );
  }
}
