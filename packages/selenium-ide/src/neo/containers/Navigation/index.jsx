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
import { observer, Provider } from "mobx-react";
import { PropTypes as MobxPropTypes } from "mobx-react";
import { modifier } from "modifier-keys";
import UiState from "../../stores/view/UiState";
import ModalState from "../../stores/view/ModalState";
import PlaybackState from "../../stores/view/PlaybackState";
import VerticalTabBar from "../../components/VerticalTabBar";
import SearchBar from "../../components/SearchBar";
import TestList from "../../components/TestList";
import SuiteList from "../../components/SuiteList";
import ExecutionPlan from "../../components/ExecutionPlan";
import Runs from "../../components/Runs";
import AddButton from "../../components/ActionButtons/Add";
import "./style.css";

@observer export default class Navigation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: "Runs",
      lastSelection: {}
    };
    this.handleChangedTab = this.handleChangedTab.bind(this);
  }
  static propTypes = {
    suites: MobxPropTypes.arrayOrObservableArray.isRequired,
    tests: MobxPropTypes.arrayOrObservableArray.isRequired,
    moveTest: PropTypes.func.isRequired
  };
  handleChangedTab(tab) {
    const lastSelection = this.state.lastSelection;
    this.setState({
      tab,
      lastSelection: UiState.selectedTest
    });
    UiState.selectTest(lastSelection.test, lastSelection.suite);
  }
  handleKeyDown(event) {
    const e = event.nativeEvent;
    modifier(e);
    const noModifiers = (!e.primaryKey && !e.secondaryKey);

    if (e.target.localName !== "input" && noModifiers && e.key === "ArrowRight") {
      event.preventDefault();
      event.stopPropagation();
      UiState.focusEditor();
    }
  }
  render() {
    return (
      <aside
        className="test-cases"
        onKeyDown={this.handleKeyDown.bind(this)}
        onMouseEnter={() => UiState.setNavigationHover(true)}
        onMouseLeave={() => UiState.setNavigationHover(false)}
      >
        <VerticalTabBar tabs={["Tests", "Test suites", "Runs"]} defaultTab="Runs" tabChanged={this.handleChangedTab}>
          {this.state.tab === "Tests" && <AddButton data-tip={"<p>Add new test</p>"} onClick={ModalState.createTest} />}
          {this.state.tab === "Test suites" && <AddButton data-tip={"<p>Add new test suite</p>"} onClick={ModalState.createSuite} />}
        </VerticalTabBar>
        <Provider renameTest={ModalState.renameTest}>
          <React.Fragment>
            {this.state.tab === "Tests" && <React.Fragment>
              <SearchBar value={UiState.filterTerm} filter={UiState.changeFilter} />
              <TestList tests={this.props.tests} removeTest={ModalState.deleteTest} />
            </React.Fragment>
            }
            {this.state.tab === "Test suites" && <React.Fragment>
              <SearchBar value={UiState.filterTerm} filter={UiState.changeFilter} />
              <SuiteList
                suites={this.props.suites}
                rename={ModalState.renameSuite}
                editSettings={ModalState.editSuiteSettings}
                selectTests={ModalState.editSuite}
                removeSuite={ModalState.deleteSuite}
                moveTest={this.props.moveTest}
              />
            </React.Fragment>
            }
            {this.state.tab === "Runs" && <React.Fragment>
              <ExecutionPlan />
              <Runs
                runs={PlaybackState.finishedTestsCount}
                failures={PlaybackState.failures}
                hasError={!!PlaybackState.failures}
                progress={PlaybackState.finishedTestsCount}
                totalProgress={PlaybackState.testsCount}
              />
            </React.Fragment>
            }
          </React.Fragment>
        </Provider>
      </aside>
    );
  }
}
