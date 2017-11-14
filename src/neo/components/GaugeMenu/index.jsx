import React from "react";
import PropTypes from "prop-types";
import Slider from "rc-slider";
import Menu, { MenuDirections } from "../Menu";
import "rc-slider/assets/index.css";
import "./style.css";

export default class GaugeMenu extends React.Component {
  static propTypes = {
    opener: PropTypes.element
  };
  render() {
    return (
      <Menu opener={this.props.opener} direction={MenuDirections.Bottom} closeOnClick={false} width={40} padding={0}>
        <div className="speed-gauge">
          <span>Fast</span>
          <Slider vertical included={false} defaultValue={50} onChange={console.log.bind(console)} />
          <span>Slow</span>
        </div>
      </Menu>
    );
  }
}

