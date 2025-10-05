import React from 'react';

const Pcr = ({ value }) => {
  let arrow = null;
  if (value > 1.5) {
    arrow = <span style={{ color: 'orange', marginLeft: 8 }}>Overbought</span>;
  } else if (value > 1 && value <= 1.5) {
    arrow = <span style={{ color: 'green', marginLeft: 8 }}>&#9650;</span>; // ▲
  } else if (value > 0.95 && value <= 1) {
    arrow = <span style={{ color: 'blue', marginLeft: 8 }}>&#9679;</span>; // ●
  } else if (value < 0.95 && value > 0.65) {
    arrow = <span style={{ color: 'red', marginLeft: 8 }}>&#9660;</span>; // ▼
  } else if (value <= 0.65) {
    arrow = <span style={{ color: 'purple', marginLeft: 8 }}>Oversold</span>;
  }

  return (
    <div>
      <h2>Put-Call Ratio (PCR)</h2>
      <h3>
        {value ? value.toFixed(2) : 'N/A'}
        {arrow}
      </h3>
    </div>
  );
};

export default Pcr;
