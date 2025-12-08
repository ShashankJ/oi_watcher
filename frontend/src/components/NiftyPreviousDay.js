import React, { useState, useEffect, useCallback } from 'react';
import axios from '../config/axios';
import { Typography, Box, CircularProgress, Grid } from '@mui/material';

const NiftyPreviousDay = () => {
  const [ohlcData, setOhlcData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOhlcData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/nifty_previous_day');
      setOhlcData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch OHLC data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOhlcData(); // Fetch only once on component mount
  }, [fetchOhlcData]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={100}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (!ohlcData) {
    return <Typography>No OHLC data available</Typography>;
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Previous Day OHLC
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography variant="body2" color="textSecondary">
            Open
          </Typography>
          <Typography variant="h6" color="primary">
            {ohlcData.open?.toFixed(2) || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="textSecondary">
            High
          </Typography>
          <Typography variant="h6" color="success.main">
            {ohlcData.high?.toFixed(2) || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="textSecondary">
            Low
          </Typography>
          <Typography variant="h6" color="error.main">
            {ohlcData.low?.toFixed(2) || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="body2" color="textSecondary">
            Close
          </Typography>
          <Typography variant="h6">
            {ohlcData.close?.toFixed(2) || 'N/A'}
          </Typography>
        </Grid>
      </Grid>
      {ohlcData.date && (
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          Date: {new Date(ohlcData.date).toLocaleDateString()}
        </Typography>
      )}
    </Box>
  );
};

export default NiftyPreviousDay;
