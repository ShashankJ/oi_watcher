import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress } from '@mui/material';

const StochasticRsi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let intervalId;

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/stochrsi_nifty50_5m`);
        setData(response.data);
        setError(null);
        console.log('Stochastic RSI API response:', response.data);
      } catch (err) {
        setError('Failed to fetch Stochastic RSI 14: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData(); // Initial fetch
    intervalId = setInterval(fetchData, 60000); // Poll every 60 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  return (
    <div style={{ marginTop: 24, border: '1px solid #ccc', borderRadius: 8, padding: 16, maxWidth: 400 }}>
      <Typography component="h2" variant="h6" color="primary" gutterBottom>
        Stochastic RSI (Nifty 50, 5m)
      </Typography>
      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}
      {data && !data.error && (
        <>
          <Typography component="p" variant="h4">
            {data.stochrsi !== undefined ? data.stochrsi.toFixed(2) : 'N/A'}
          </Typography>
          <Typography gutterBottom>{data.analysis}</Typography>
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell><strong>K</strong></TableCell>
                  <TableCell>{data.k}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>D</strong></TableCell>
                  <TableCell>{data.d}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Signal</strong></TableCell>
                  <TableCell>{data.signal}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><strong>Timestamp</strong></TableCell>
                  <TableCell>{data.timestamp}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
      {data && data.error && <p style={{ color: 'red' }}>{data.error}</p>}
    </div>
  );
};

export default StochasticRsi;
