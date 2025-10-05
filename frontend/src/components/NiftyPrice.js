import React from 'react';

const NiftyPrice = ({ value }) => {
  return (
    <div>
      <h2>Nifty Current Price</h2>
      <h3>{value ? value.toFixed(2) : 'N/A'}</h3>
    </div>
  );
};

export default NiftyPrice;
