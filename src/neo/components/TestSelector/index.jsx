import React from "react";
import PropTypes from "prop-types";
import { PropTypes as MobxPropTypes } from "mobx-react";
import Modal from "../Modal";
import ModalHeader from "../ModalHeader";
import FlatButton from "../FlatButton";
import SearchBar from "../SearchBar";
import Checkbox from "../Checkbox";
import "./style.css";

export default class TestSelector extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initialState(props);
    this.selectTest = this.selectTest.bind(this);
    this.filter = this.filter.bind(this);
  }
  initialState(props) {
    return {
      selectedTests: props.selectedTests ? props.selectedTests.reduce((selections, selection) => { selections[selection.id] = selection; return selections; }, {}) : {},
      filterTerm: ""
    };
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.tests) {
      this.setState(this.initialState(nextProps));
    }
  }
  componentDidUpdate(prevProps) {
    if (this.props.isEditing && !prevProps.isEditing) {
      this.input.focus();
    }
  }
  selectTest(isSelected, test) {
    this.setState({
      selectedTests: { ...this.state.selectedTests, [test.id]: isSelected ? test : undefined}
    });
  }
  filter(filterTerm) {
    this.setState({ filterTerm });
  }
  render() {
    return (
      <Modal className="test-selector" isOpen={this.props.isEditing} onRequestClose={this.props.cancelSelection}>
        <form>
          <ModalHeader title="Select Tests" close={this.props.cancelSelection} />
          <SearchBar inputRef={(input) => { this.input = input; }} filter={this.filter} />
          <TestSelectorList tests={this.props.tests} filterTerm={this.state.filterTerm} selectedTests={this.state.selectedTests} selectTest={this.selectTest} />
          <hr />
          <span className="right">
            <FlatButton onClick={this.props.cancelSelection}>Cancel</FlatButton>
            <FlatButton className="primary" type="submit" onClick={() => {this.props.completeSelection(Object.values(this.state.selectedTests));}} style={{
              marginRight: "0"
            }}>Add</FlatButton>
          </span>
          <div className="clear"></div>
        </form>
      </Modal>
    );
  }
  static propTypes = {
    isEditing: PropTypes.bool.isRequired,
    tests: MobxPropTypes.arrayOrObservableArray.isRequired,
    selectedTests: PropTypes.array,
    cancelSelection: PropTypes.func.isRequired,
    completeSelection: PropTypes.func.isRequired
  };
}

class TestSelectorList extends React.Component {
  static propTypes = {
    tests: MobxPropTypes.arrayOrObservableArray.isRequired,
    filterTerm: PropTypes.string.isRequired,
    selectedTests: PropTypes.object.isRequired,
    selectTest: PropTypes.func.isRequired
  };
  handleChange(test, e) {
    this.props.selectTest(e.target.checked, test);
  }
  render() {
    return (
      <ul className="tests">
        {this.props.tests.filter(({name}) => (name.indexOf(this.props.filterTerm) !== -1)).map(test => (
          <li key={test.id}>
            <Checkbox label={test.name} checked={!!this.props.selectedTests[test.id]} onChange={this.handleChange.bind(this, test)} />
          </li>
        ))}
      </ul>
    );
  }
}
