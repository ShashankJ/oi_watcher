import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Typography, Box, Table, TableBody, TableCell, TableContainer, TableRow, Paper, CircularProgress, Collapse, IconButton } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const StochasticRsi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTableVisible, setTableVisible] = useState(false);

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

  const handleToggleTable = () => {
    setTableVisible(!isTableVisible);
  };

  return (
    <div style={{ marginTop: 4, border: '1px solid #ccc', borderRadius: 8, padding: 16, maxWidth: 500 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography component="h2" variant="h6" color="primary" gutterBottom sx={{ mb: 0 }}>
          Stochastic RSI (Nifty 50, 5m)
        </Typography>
        {data && !data.error && (
          <IconButton onClick={handleToggleTable} size="small">
            {isTableVisible ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        )}
      </Box>
      {loading && <CircularProgress />}
      {error && <Typography color="error">{error}</Typography>}
      {data && !data.error && (
        <>
          <Typography component="p" variant="h4">
            {data.stochrsi !== undefined ? data.stochrsi.toFixed(2) : 'N/A'}
          </Typography>
          <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            {data.analysis}
            {data.analysis?.includes('Bullish') && <ArrowUpwardIcon color="success" sx={{ ml: 0.5 }} />}
            {data.analysis?.includes('Bearish') && <ArrowDownwardIcon color="error" sx={{ ml: 0.5 }} />}
          </Typography>
          <Collapse in={isTableVisible}>
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
          </Collapse>
        </>
      )}
      {data && data.error && <p style={{ color: 'red' }}>{data.error}</p>}
    </div>
  );
};

export default StochasticRsi;
