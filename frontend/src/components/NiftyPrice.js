import React from 'react';
import { Typography } from '@mui/material';

const NiftyPrice = ({ value }) => {
  return (
    <>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Nifty Current Price
      </Typography>
      <Typography component="p" variant="h4">
        {value ? value.toFixed(2) : 'N/A'}
      </Typography>
    </>
  );
};

export default NiftyPrice;
