import React, { Component } from 'react';
import LED from './LED';
import './LEDSwitch.css';

class LEDSwitch extends Component {
    render() {
        const { focus_data, stress_data } = this.props;

        // focus_data와 stress_data 중 하나만 처리하도록 분리
        const isFocusMode = focus_data !== undefined;

        // focus_data에 따라 LED 색상 결정
        const focusColor1 = focus_data === 'on' ? 'red' : 'gray';
        const focusColor2 = focus_data === 'on' ? 'gray' : 'green';

        // stress_data에 따라 LED 색상 결정
        const stressColor1 = stress_data === 'high' ? 'orange' : 'gray';
        const stressColor2 = stress_data === 'high' ? 'gray' : 'blue';

        return (
            <div className="led-container">
                <h3>
                    {isFocusMode
                        ? `Focus Data: ${parseFloat(focus_data).toFixed(2)}`
                        : `Stress Data: ${parseFloat(stress_data).toFixed(2)}`}
                </h3>

                {/* LED 컴포넌트 */}
                {isFocusMode ? (
                    <>
                        <LED color={focusColor1}/>
                        <LED color={focusColor2} />
                    </>
                ) : (
                    <>
                        <LED color={stressColor1} />
                        <LED color={stressColor2} />
                    </>
                )}
            </div>
        );
    }
}

export default LEDSwitch;
