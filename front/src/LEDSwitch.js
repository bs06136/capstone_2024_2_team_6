import React, { Component } from 'react';
import LED from './LED';
import './LEDSwitch.css';

class LEDSwitch extends Component {
  render() {
    const data = this.props.data;

    // data에 따라 LED 색상 결정
    const color1 = data === 'on' ? 'red' : 'gray';
    const color2 = data === 'on' ? 'gray' : 'green';

    return (
      <div className="led-container">
        <h3>Data: { data }</h3>

        {/* LED 컴포넌트 */}
        <LED color={color1} />
        <LED color={color2} />
      </div>
    );
  }
}

export default LEDSwitch;
