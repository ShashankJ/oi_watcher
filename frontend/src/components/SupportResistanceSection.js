import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
} from "@mui/material";

const intervals = [
  { label: "5 Minutes", interval: 5, unit: "minute" },
  { label: "15 Minutes", interval: 15, unit: "minute" },
  { label: "1 Day", interval: 1, unit: "day" },
];

function SRTable({ title, data }) {
  if (!data || data.length === 0) return <Typography>No data</Typography>;
  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell>{title}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(([date, value], idx) => (
            <TableRow key={idx}>
              <TableCell>{new Date(date).toLocaleDateString()}</TableCell>
              <TableCell>{value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default function SupportResistanceSection() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});
  const [error, setError] = useState({});

  useEffect(() => {
    intervals.forEach(({ label, interval, unit }) => {
      setLoading((prev) => ({ ...prev, [label]: true }));
      axios
        .get(`/support_resistance?interval=${interval}&unit=${unit}`)
        .then((res) => {
          setResults((prev) => ({ ...prev, [label]: res.data }));
          setLoading((prev) => ({ ...prev, [label]: false }));
        })
        .catch((err) => {
          setError((prev) => ({ ...prev, [label]: "Failed to fetch" }));
          setLoading((prev) => ({ ...prev, [label]: false }));
        });
    });
  }, []);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Support & Resistance
      </Typography>
      <Grid container spacing={3}>
        {intervals.map(({ label }) => (
          <Grid item xs={12} md={6} lg={4} key={label}>
            <Typography variant="h6">{label}</Typography>
            {loading[label] && <CircularProgress />}
            {error[label] && <Typography color="error">{error[label]}</Typography>}
            {results[label] && (
              <Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <SRTable title="Support" data={results[label].supports} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <SRTable
                      title="Resistance"
                      data={results[label].resistances}
                    />
                  </Grid>
                </Grid>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  <strong>Trade Zone:</strong> {results[label].trade_zone}
                </Typography>
              </Box>
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
