import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const OiChart = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 400 }}>
      <h2>OI Comparison</h2>
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
          <Bar dataKey="call_oi" fill="#8884d8" name="Call OI" />
          <Bar dataKey="put_oi" fill="#82ca9d" name="Put OI" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OiChart;
