import React, { Component } from 'react';
import LED from './LED';
import './LEDSwitch.css';

class LEDSwitch extends Component {
  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.forceUpdate(); // profileData 값이 변경될 때마다 컴포넌트를 업데이트
    }
  }

  render() {
    const data = this.props.data;

    // profileData에 따라 LED 색상 결정
    const color1 = data === 'on' ? 'red' : 'gray';
    const color2 = data === 'on' ? 'gray' : 'green';

    return (
      <div className="led-container">
        <h3>Profile Data: { data }</h3>

        {/* LED 컴포넌트 */}
        <LED color={color1} />
        <LED color={color2} />
      </div>
    );
  }
}

export default LEDSwitch;
