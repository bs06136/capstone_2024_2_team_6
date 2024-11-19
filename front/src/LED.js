import React from 'react';
import './LED.css';

const LED = ({ color }) => {
  return <div className="led" style={{ backgroundColor: color }}></div>;
};

export default LED;
