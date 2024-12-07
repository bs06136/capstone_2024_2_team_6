import React, { Component } from 'react';
import LED from './LED';
import './LEDSwitch.css';

class LEDSwitch extends Component {
    render() {
        const { type, data } = this.props;

        // 디버깅용 로그
        console.log("LEDSwitch Props:", { type, data });

        // 데이터 타입에 따른 라벨과 색상 결정
        const label = type === 'focus' ? `Focus` : `Stress`;
        const color = data >= 0.4 ? 'red' : 'green';

        return (
            <div className="led-container">
                <h3>{label}</h3>
                <LED color={color} />
            </div>
        );
    }
}


export default LEDSwitch;