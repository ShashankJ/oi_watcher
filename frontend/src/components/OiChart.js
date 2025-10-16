import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const OiChart = ({ data }) => {
  // Better error handling
  if (!data || !data.calls || !data.puts) {
    return <div className="chart-loading">Loading data...</div>;
  }

  // Transform the data for the chart
  const chartData = data.calls.map((call, idx) => {
    const put = data.puts[idx] || {};
    return {
      strike: call.strike_price,
      call_oi_change: call.oi_change,
      put_oi_change: put.oi_change || 0,
    };
  });

  // Get the current Nifty price from data
  const currentPrice = data["Nifty Price"];

  return (
    <div style={{ width: '100%', height: 400 }}>
      <h2>OI Change Comparison</h2>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="strike" />
          <YAxis />
          <Tooltip
            formatter={(value, name) => [`${value}`, name === "call_oi_change" ? "Call OI Change" : "Put OI Change"]}
            labelFormatter={(label) => `Strike: ${label}`}
          />
          <Legend />
          {currentPrice && <ReferenceLine x={currentPrice} stroke="#666" label="Current Price" />}
          <ReferenceLine y={0} stroke="#000" />
          <Bar dataKey="call_oi_change" fill="#FF4D4F" name="Call OI Change" />
          <Bar dataKey="put_oi_change" fill="#52C41A" name="Put OI Change" />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ textAlign: 'center', marginTop: 15 }}>
        <div>PCR: {data.pcr?.toFixed(2)}</div>
        <div>
          Call OI Change: {data["Call OI Change"]} | Put OI Change: {data["Put OI Change"]}
        </div>
      </div>
    </div>
  );
};

export default OiChart;
