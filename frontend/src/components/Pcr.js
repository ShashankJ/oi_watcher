import React from 'react';

const Pcr = ({ value }) => {
  return (
    <div>
      <h2>Put-Call Ratio (PCR)</h2>
      <h3>{value ? value.toFixed(2) : 'N/A'}</h3>
    </div>
  );
};

export default Pcr;
