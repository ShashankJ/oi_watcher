import React from 'react';

const OptionTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>No option data to display.</p>;
  }

  const calls = data.filter(d => d.option_type === 'CE').sort((a, b) => a.strike_price - b.strike_price);
  const puts = data.filter(d => d.option_type === 'PE').sort((a, b) => a.strike_price - b.strike_price);

  return (
    <div>
      <h2>Option Contracts</h2>
      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
        <div>
          <h3>Call Options</h3>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Strike</th>
                <th>LTP</th>
                <th>OI</th>
                <th>Change in OI</th>
              </tr>
            </thead>
            <tbody>
              {calls.map(c => (
                <tr key={c.strike_price}>
                  <td>{c.strike_price}</td>
                  <td>{c.ltp}</td>
                  <td>{c.oi}</td>
                  <td>{c.change_in_oi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h3>Put Options</h3>
          <table border="1" cellPadding="5">
            <thead>
              <tr>
                <th>Strike</th>
                <th>LTP</th>
                <th>OI</th>
                <th>Change in OI</th>
              </tr>
            </thead>
            <tbody>
              {puts.map(p => (
                <tr key={p.strike_price}>
                  <td>{p.strike_price}</td>
                  <td>{p.ltp}</td>
                  <td>{p.oi}</td>
                  <td>{p.change_in_oi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OptionTable;
