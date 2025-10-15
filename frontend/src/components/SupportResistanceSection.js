import React, { useEffect, useState } from "react";
import axios from "axios";

const intervals = [
  { label: "15 Minutes", interval: 15, unit: "minute" },
  { label: "30 Minutes", interval: 30, unit: "minute" },
  { label: "1 Day", interval: 1, unit: "day" }
];

function SRTable({ title, data }) {
  if (!data || data.length === 0) return <div>No data</div>;
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', minWidth: 180, maxWidth: 300, marginBottom: '0.5em', background: '#fafbfc' }}>
      <thead>
        <tr>
          <th style={{ border: '1px solid #ccc', padding: '4px' }}>Date</th>
          <th style={{ border: '1px solid #ccc', padding: '4px' }}>{title}</th>
        </tr>
      </thead>
      <tbody>
        {data.map(([date, value], idx) => (
          <tr key={idx}>
            <td style={{ border: '1px solid #ccc', padding: '4px' }}>{new Date(date).toLocaleDateString()}</td>
            <td style={{ border: '1px solid #ccc', padding: '4px' }}>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function SupportResistanceSection() {
  const [results, setResults] = useState({});

  useEffect(() => {
    intervals.forEach(({ label, interval, unit }) => {
      axios.get(`/support_resistance?interval=${interval}&unit=${unit}`)
        .then(res => {
          setResults(prev => ({ ...prev, [label]: res.data }));
        });
    });
  }, []);

  return (
    <div>
      <h2>Support & Resistance</h2>
      {intervals.map(({ label }) => (
        <div key={label} style={{marginBottom: '1em'}}>
          <h3>{label}</h3>
          {results[label] ? (
            <div style={{ display: 'flex', gap: '2em', alignItems: 'flex-start' }}>
              <SRTable title="Support" data={results[label].supports} />
              <SRTable title="Resistance" data={results[label].resistances} />
              <div style={{ alignSelf: 'center', marginLeft: 16 }}><b>Trade Zone:</b> {results[label].trade_zone}</div>
            </div>
          ) : (
            <div>Loading...</div>
          )}
        </div>
      ))}
    </div>
  );
}
