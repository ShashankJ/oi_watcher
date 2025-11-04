import React from 'react';
import {Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,} from '@mui/material';

function OptionTable({data}) {
    if (!data || !data.calls || !data.puts) {
        return <div>Loading...</div>;
    }

    let arrow = null;
    let total_call_oi_change = data['Call OI Change'];
    let total_put_oi_change = data['Put OI Change'];
    if (total_put_oi_change > total_call_oi_change) {
        arrow = <span style={{color: 'green', marginLeft: 8}}>&#9650;</span>; // ▲
    } else if (total_call_oi_change > total_put_oi_change) {
        arrow = <span style={{color: 'red', marginLeft: 8}}>&#9660;</span>; // ▼
    } else {
        arrow = <span style={{color: 'blue', marginLeft: 8}}>&#9679;</span>; // ●
    }

    return (
        <Box>
            <Typography variant="h6" gutterBottom component="div">
                OI Change Table
            </Typography>
            <details style={{marginTop: 8}}>
                <summary style={{
                    listStyle: 'none',
                    cursor: 'pointer',
                    outline: 'none',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center'
                }}>
                    <Typography variant="h6" component="span" sx={{display: 'inline-block', mr: 1}}>
                        Options Table
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Toggle</Typography>
                </summary>
                <div>
                    <TableContainer component={Paper}>
                        <Table aria-label="option table">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Strike Price</TableCell>
                                    <TableCell align="right">Call OI Change</TableCell>
                                    <TableCell align="right">Put OI Change</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.calls.map((call, idx) => (
                                    <TableRow key={call.instrument_key}>
                                        <TableCell component="th" scope="row">
                                            {call.strike_price}
                                        </TableCell>
                                        <TableCell align="right">{call.oi_change}</TableCell>
                                        <TableCell align="right">
                                            {data.puts[idx] ? data.puts[idx].oi_change : '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </details>
            <Box sx={{mt: 2}}>
                <Typography variant="h6" gutterBottom component="div">
                    Total Change in Call and PUT OI
                </Typography>
                <Typography variant="body1">
                    CALL OI Change: {data['Call OI Change']}
                </Typography>
                <Typography variant="body1">
                    PUT OI Change: {data['Put OI Change']}
                </Typography>
                <Typography variant="h6" component="div">
                    Signal {arrow}
                </Typography>
            </Box>
        </Box>
    );
}

export default OptionTable;
