import React, { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails,
    CircularProgress, Chip
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RemoveIcon from '@mui/icons-material/Remove';
import axios from '../config/axios';

const AlgoSignals = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/nifty_algo_signals');
            setData(response.data);
            setError(null);
        } catch (err) {
            console.error('API Error:', err);
            setError('Failed to fetch signals');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // 60 seconds
        return () => clearInterval(interval);
    }, []);

    const getSignalIcon = (signal) => {
        if (!signal) return <RemoveIcon color="disabled" />;
        const s = signal.toUpperCase();
        if (s === 'BUY') {
            return <ArrowUpwardIcon color="success" />;
        } else if (s === 'SELL') {
            return <ArrowDownwardIcon color="error" />;
        }
        return <RemoveIcon color="warning" />;
    };

    const getSignalChip = (signal) => {
        if (!signal) return null;
        const s = signal.toUpperCase();
        let color = 'default';
        if (s === 'BUY') color = 'success';
        else if (s === 'SELL') color = 'error';
        else if (s === 'HOLD') color = 'warning';

        return <Chip label={s} color={color} size="small" />;
    };

    const formatKey = (key) => {
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    const renderDetails = (obj) => {
        if (!obj) return null;
        return Object.entries(obj).map(([key, value]) => {
            if (key === 'signal' || key === 'datetime') return null;
            return (
                <Box key={key} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                        {formatKey(key)}:
                    </Typography>
                    <Typography variant="body2">
                        {value === null ? 'N/A' : (typeof value === 'number' && !Number.isInteger(value)) ? value.toFixed(2) : String(value)}
                    </Typography>
                </Box>
            );
        });
    };

    if (loading && !data) {
        return (
            <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress size={24} />
            </Paper>
        );
    }

    if (error && !data) {
        return (
            <Paper sx={{ p: 2 }}>
                <Typography color="error">{error}</Typography>
            </Paper>
        );
    }

    const algorithms = data ? Object.keys(data).filter(key => key !== 'timestamp') : [];

    // We expect the backend to return 'timestamp' in ISO format or similar
    const timestamp = data?.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A';

    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%', position: 'sticky', top: 16 }}>
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6" color="primary" gutterBottom>
                    Algo Signals
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Updated: {timestamp}
                </Typography>
            </Box>

            {algorithms.map((algoName) => {
                const algoData = data[algoName];
                const signal = algoData.signal || algoData.Signal;

                return (
                    <Accordion key={algoName} disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #eee' }}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{ px: 1 }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', pr: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {getSignalIcon(signal)}
                                    <Typography variant="subtitle2" sx={{ wordBreak: 'break-word' }}>{algoName}</Typography>
                                </Box>
                                {getSignalChip(signal)}
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 0, pb: 1, px: 2, bgcolor: '#fafafa' }}>
                            {renderDetails(algoData)}
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </Paper>
    );
};

export default AlgoSignals;

