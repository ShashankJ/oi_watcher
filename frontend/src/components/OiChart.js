import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OiChart = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 400 }}>
      <h2>OI Change Comparison</h2>
      <ResponsiveContainer>
        <BarChart
          data={data}
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
          <Tooltip />
          <Legend />
          <Bar dataKey="call_oi_change" fill="#8884d8" name="Call OI Change" />
          <Bar dataKey="put_oi_change" fill="#82ca9d" name="Put OI Change" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OiChart;
