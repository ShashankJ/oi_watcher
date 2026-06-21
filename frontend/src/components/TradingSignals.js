import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Paper, CircularProgress, Chip, Snackbar, Alert } from '@mui/material';
import axios from '../config/axios';

const createSignalSnapshot = (signalsData) => {
    const strategies = signalsData?.strategies || {};
    return JSON.stringify(Object.keys(strategies).sort().map((name) => [name, strategies[name]]));
};

const getChangedSignals = (previousData, nextData) => {
    const previousStrategies = previousData?.strategies || {};
    const nextStrategies = nextData?.strategies || {};
    const names = Array.from(new Set([
        ...Object.keys(previousStrategies),
        ...Object.keys(nextStrategies)
    ])).sort();

    return names.filter((name) => previousStrategies[name] !== nextStrategies[name]);
};

const TradingSignals = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [notification, setNotification] = useState(null);
    const previousSignalsRef = useRef(null);

    const showBrowserNotification = useCallback((message) => {
        if (!('Notification' in window)) return;

        if (window.Notification.permission === 'granted') {
            new window.Notification('Trading Signals Changed', { body: message });
            return;
        }

        if (window.Notification.permission === 'default') {
            window.Notification.requestPermission().then((permission) => {
                if (permission === 'granted') {
                    new window.Notification('Trading Signals Changed', { body: message });
                }
            });
        }
    }, []);

    const fetchData = useCallback(async () => {
        try {
            const response = await axios.get('/api/trading_signals');
            const nextData = response.data;
            const previousEntry = previousSignalsRef.current;
            const nextSnapshot = createSignalSnapshot(nextData);

            if (previousEntry && previousEntry.snapshot !== nextSnapshot) {
                const changedSignals = getChangedSignals(previousEntry.data, nextData);
                const message = changedSignals.length
                    ? `${changedSignals.join(', ')} updated`
                    : 'Trading signals updated';

                setNotification(message);
                showBrowserNotification(message);
            }

            previousSignalsRef.current = {
                snapshot: nextSnapshot,
                data: nextData
            };
            setData(nextData);
            setError(null);
        } catch (err) {
            console.error('Trading signals API Error:', err);
            setError('Failed to fetch trading signals');
        } finally {
            setLoading(false);
        }
    }, [showBrowserNotification]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const getChipColor = (status) => {
        const s = String(status || '').toUpperCase();
        if (s === 'OPEN' || s === 'ONLINE') return 'success';
        if (s === 'WAITING') return 'warning';
        if (s === 'CLOSED' || s === 'OFFLINE') return 'error';
        return 'default';
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

    const timestamp = data?.timestamp ? new Date(data.timestamp).toLocaleString() : 'N/A';
    const strategies = data?.strategies || {};

    return (
        <>
            <Paper sx={{ p: 2 }}>
                <Box sx={{ mb: 1.5 }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                        Trading Signals
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                        Symbol: {data?.symbol || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Updated: {timestamp}
                    </Typography>
                </Box>

                {Object.entries(strategies).map(([name, status]) => (
                    <Box
                        key={name}
                        sx={{
                            py: 0.75,
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                            {name}
                        </Typography>
                        <Chip label={String(status)} size="small" color={getChipColor(status)} />
                    </Box>
                ))}
            </Paper>
            <Snackbar
                open={Boolean(notification)}
                autoHideDuration={6000}
                onClose={() => setNotification(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert severity="info" variant="filled" onClose={() => setNotification(null)}>
                    {notification}
                </Alert>
            </Snackbar>
        </>
    );
};

export default TradingSignals;
