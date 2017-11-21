import React from "react";
import PropTypes from "prop-types";
import { DragSource } from "react-dnd";
import classNames from "classnames";
import ListMenu, { ListMenuItem } from "../ListMenu";
import MoreButton from "../ActionButtons/More";
import RemoveButton from "../ActionButtons/Remove";
import "./style.css";

export const Type = "test";
const testSource = {
  beginDrag(props) {
    props.setDrag(true);
    return {
      id: props.test.id,
      suite: props.suite.id
    };
  },
  endDrag(props) {
    props.setDrag(false);
  }
};
function collect(connect, monitor) {
  return {
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  };
}

export default class Test extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    test: PropTypes.object.isRequired,
    suite: PropTypes.object,
    selected: PropTypes.bool,
    changed: PropTypes.bool,
    isDragging: PropTypes.bool,
    selectTest: PropTypes.func.isRequired,
    renameTest: PropTypes.func,
    removeTest: PropTypes.func.isRequired,
    connectDragSource: PropTypes.func,
    dragInProgress: PropTypes.bool,
    setDrag: PropTypes.func
  };
  handleClick(test, suite) {
    this.props.selectTest(test, suite);
  }
  render() {
    const rendered = <a
      href="#"
      className={classNames("test", this.props.className, {"changed": this.props.changed}, {"selected": this.props.selected}, {"dragging": this.props.dragInProgress})}
      onClick={this.handleClick.bind(this, this.props.test, this.props.suite)}
      tabIndex="-1"
      style={{
        display: this.props.isDragging ? "none" : "flex"
      }}>
      <span>{this.props.test.name}</span>
      {this.props.renameTest ?
        <ListMenu width={130} padding={-5} opener={
          <MoreButton />
        }>
          <ListMenuItem onClick={() => this.props.renameTest(this.props.test.name, this.props.test.setName)}>Rename</ListMenuItem>
          <ListMenuItem onClick={this.props.removeTest}>Delete</ListMenuItem>
        </ListMenu> :
        <RemoveButton onClick={(e) => {e.stopPropagation(); this.props.removeTest();}} />}
    </a>;
    return (this.props.suite ? this.props.connectDragSource(rendered) : rendered);
  }
}

export const DraggableTest = DragSource(Type, testSource, collect)(Test);
