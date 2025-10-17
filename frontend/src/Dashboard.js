import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Grid, Paper, Typography } from '@mui/material';
import NiftyPrice from './components/NiftyPrice';
import Pcr from './components/Pcr';
import StochasticRsi from './components/StochasticRsi';
import OiChart from './components/OiChart';
import OptionTable from './components/OptionTable';
import SupportResistanceSection from './components/SupportResistanceSection';

const Dashboard = () => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/oi_data');
            setData(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch data. Is the backend running?');
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 30000); // Poll every 30 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            {error && <Typography color="error">{error}</Typography>}
            {data && !data.error ? (
                <Grid container spacing={3}>
                    {/* Nifty Price */}
                    <Grid item xs={12} md={4} lg={3}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <NiftyPrice value={data['Nifty Price']} />
                        </Paper>
                    </Grid>
                    {/* Stochastic RSI */}
                    <Grid item xs={12} md={4} lg={3}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <StochasticRsi />
                        </Paper>
                    </Grid>
                    {/* PCR */}
                    <Grid item xs={12} md={4} lg={3}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <Pcr value={data.pcr} />
                        </Paper>
                    </Grid>
                    {/* OI Chart */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <OiChart data={data} />
                        </Paper>
                    </Grid>
                    {/* Option Table */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <OptionTable data={data} />
                        </Paper>
                    </Grid>
                    {/* Support and Resistance */}
                    <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
                            <SupportResistanceSection />
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

