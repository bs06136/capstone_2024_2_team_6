import React from 'react';

const ColorButton = ({ color, onClick }) => {
  return (
    <button
      onClick={() => onClick(color)}
      style={{
        backgroundColor: color,
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        padding: '10px 20px',
        margin: '5px',
        cursor: 'pointer'
      }}
    >
      {color.charAt(0).toUpperCase() + color.slice(1)}
    </button>
  );
};

export default ColorButton;
