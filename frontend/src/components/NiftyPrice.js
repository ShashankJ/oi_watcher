import React, { useState, useEffect } from 'react';
import { Typography, Box, CircularProgress } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import axios from '../config/axios';

const NiftyPrice = () => {
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let intervalId;

    const fetchNiftyPrice = async () => {
      try {
        const response = await axios.get('/api/nifty_curr');
        setPriceData(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch');
        console.error('Error fetching Nifty price:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNiftyPrice();
    intervalId = setInterval(fetchNiftyPrice, 60000); // Refresh every 60 seconds

    return () => clearInterval(intervalId);
  }, []);

  const isPositive = priceData?.change >= 0;
  const changeColor = isPositive ? 'success.main' : 'error.main';

  return (
    <>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Nifty Current Price
      </Typography>

      {loading && !priceData ? (
        <CircularProgress size={24} />
      ) : error && !priceData ? (
        <Typography variant="body2" color="error">{error}</Typography>
      ) : priceData ? (
        <>
          <Typography component="p" variant="h4">
            {priceData.ltp?.toFixed(2) || 'N/A'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {isPositive ? (
              <ArrowUpwardIcon sx={{ color: changeColor, fontSize: 20, mr: 0.5 }} />
            ) : (
              <ArrowDownwardIcon sx={{ color: changeColor, fontSize: 20, mr: 0.5 }} />
            )}
            <Typography variant="body1" sx={{ color: changeColor, fontWeight: 'bold' }}>
              {priceData.change?.toFixed(2)} ({priceData.change_percent?.toFixed(2)}%)
            </Typography>
          </Box>
        </>
      ) : null}
    </>
  );
};

export default NiftyPrice;
