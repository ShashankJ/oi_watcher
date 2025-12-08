import React, { useState, useEffect } from 'react';
import axios from './config/axios';
import { Container, Grid, Paper, Typography, CircularProgress, Alert, AlertTitle, Box, Chip } from '@mui/material';
import NiftyPrice from './components/NiftyPrice';
import NiftyPreviousDay from './components/NiftyPreviousDay';
import Pcr from './components/Pcr';
import StochasticRsi from './components/StochasticRsi';
import OiChart from './components/OiChart';
import OptionTable from './components/OptionTable';
import SupportResistanceSection from './components/SupportResistanceSection';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdateTime, setLastUpdateTime] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/oi_data');
            setData(response.data);
            setError(null);
            setLastUpdateTime(new Date().toLocaleTimeString());
        } catch (err) {
            let errorMessage = 'Failed to fetch data from backend.';

            if (err.code === 'ECONNABORTED') {
                errorMessage = 'Request timeout. Backend is taking too long to respond. This may happen during market hours when fetching live data.';
            } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
                errorMessage = 'Cannot connect to backend server. Please ensure the backend is running on http://localhost:5000';
            } else if (err.response) {
                errorMessage = `Backend error: ${err.response.status} - ${err.response.data?.error || err.response.statusText}`;
            }

            setError(errorMessage);
            console.error('API Error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {/* Connection Status Bar */}
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h4">OI Watcher Dashboard</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {loading && <CircularProgress size={20} />}
                    {lastUpdateTime && (
                        <Chip
                            label={`Last updated: ${lastUpdateTime}`}
                            size="small"
                            color={error ? 'error' : 'success'}
                        />
                    )}
                </Box>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    <AlertTitle>Connection Error</AlertTitle>
                    {error}
                    <Box sx={{ mt: 1 }}>
                        <Typography variant="caption">
                            Backend URL: {process.env.REACT_APP_API_URL || 'http://localhost:5000'}<br/>
                            To change the backend URL, edit <code>frontend/.env</code> file.
                        </Typography>
                    </Box>
                </Alert>
            )}

            {/* Loading State */}
            {loading && !data && (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                    <Box sx={{ textAlign: 'center' }}>
                        <CircularProgress size={60} />
                        <Typography sx={{ mt: 2 }}>Loading market data...</Typography>
                        <Typography variant="caption" color="text.secondary">
                            This may take up to 60 seconds during market hours
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Main Content */}
            {data && !data.error ? (
                <Grid container spacing={3}>
                    {/* Nifty Price */}
                    <Grid item xs={12} md={4} lg={3}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <NiftyPrice />
                        </Paper>
                    </Grid>
                     {/* PCR */}
                    <Grid item xs={12} md={4} lg={3}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <Pcr value={data.pcr} />
                        </Paper>
                    </Grid>
                    {/* Option Table */}
                    <Grid item xs={12} md={6} lg={5}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <OptionTable data={data} />
                        </Paper>
                    </Grid>
                    {/* Previous Day OHLC */}
                    <Grid item xs={12} md={4} lg={3}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <NiftyPreviousDay />
                        </Paper>
                    </Grid>
                    {/* Stochastic RSI */}
                    <Grid item xs={12} md={4} lg={3}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <StochasticRsi />
                        </Paper>
                    </Grid>
                    {/* Support and Resistance */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <SupportResistanceSection />
                        </Paper>
                    </Grid>
                    {/* OI Chart */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <OiChart data={data} />
                        </Paper>
                    </Grid>
                </Grid>
            ) : (
                <Typography>{data ? data.error : 'Loading...'}</Typography>
            )}
        </Container>
    );
};

export default Dashboard;

