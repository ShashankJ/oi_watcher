import React from 'react';

function OptionTable({ data }) {
  if (!data || !data.calls || !data.puts) {
    return <div>Loading...</div>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Strike Price</th>
          <th>Call OI Change</th>
          <th>Put OI Change</th>
        </tr>
      </thead>
      <tbody>
        {data.calls.map((call, idx) => (
          <tr key={call.instrument_key}>
            <td>{call.strike_price}</td>
            <td>{call.oi_change}</td>
            <td>{data.puts[idx] ? data.puts[idx].oi_change : '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default OptionTable;
