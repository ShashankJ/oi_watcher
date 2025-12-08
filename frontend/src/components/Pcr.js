import React from 'react';
import { Typography, Box } from '@mui/material';

const Pcr = ({ value }) => {
  let arrow = null;
  let pcrStyle = {};
  let pcrText = '';

  if (value > 1.5) {
    pcrStyle = { color: 'orange' };
    pcrText = 'Overbought';
  } else if (value > 1 && value <= 1.5) {
    pcrStyle = { color: 'green' };
    arrow = <span>&#9650;</span>; // ▲
  } else if (value > 0.95 && value <= 1) {
    pcrStyle = { color: 'blue' };
    arrow = <span>&#9679;</span>; // ●
  } else if (value < 0.95 && value > 0.65) {
    pcrStyle = { color: 'red' };
    arrow = <span>&#9660;</span>; // ▼
  } else if (value <= 0.65) {
    pcrStyle = { color: 'purple' };
    pcrText = 'Oversold';
  }

  return (
    <>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Put-Call Ratio (PCR)
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography component="p" variant="h4" style={pcrStyle}>
          {value ? value.toFixed(2) : 'N/A'}
        </Typography>
        <Typography component="span" variant="h5" style={{ ...pcrStyle, marginLeft: 8 }}>
          {arrow}
          {pcrText}
        </Typography>
      </Box>
    </>
  );
};

export default Pcr;
