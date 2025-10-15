import React, { useEffect, useState } from 'react';

const StochasticRsi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let intervalId;

    const fetchData = () => {
      setLoading(true);
      fetch('http://localhost:5000/stochrsi_nifty50_5m')
        .then((res) => {
          if (!res.ok) {
            throw new Error(`API error: ${res.status}`);
          }
          return res.json();
        })
        .then((result) => {
          setData(result);
          setLoading(false);
          console.log('Stochastic RSI API response:', result);
        })
        .catch((err) => {
          setError('Failed to fetch Stochastic RSI 14: ' + err.message);
          setLoading(false);
        });
    };

    fetchData(); // Initial fetch
    intervalId = setInterval(fetchData, 60000); // Poll every 60 seconds

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, []);

  // ...rest of your component remains unchanged
};


  return (
    <div style={{ marginTop: 24, border: '1px solid #ccc', borderRadius: 8, padding: 16, maxWidth: 400 }}>
      <h2>Stochastic RSI (Nifty 50, 5m)</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && !data.error && (
        <>
          <h3>{data.stochrsi !== undefined ? data.stochrsi.toFixed(2) : 'N/A'}</h3>
          <p>{data.analysis}</p>
          <table style={{ width: '100%', marginTop: 12, borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '4px 8px', border: '1px solid #eee' }}>K</td>
                <td style={{ padding: '4px 8px', border: '1px solid #eee' }}>{data.k}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '4px 8px', border: '1px solid #eee' }}>D</td>
                <td style={{ padding: '4px 8px', border: '1px solid #eee' }}>{data.d}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '4px 8px', border: '1px solid #eee' }}>Signal</td>
                <td style={{ padding: '4px 8px', border: '1px solid #eee' }}>{data.signal}</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 'bold', padding: '4px 8px', border: '1px solid #eee' }}>Timestamp</td>
                <td style={{ padding: '4px 8px', border: '1px solid #eee' }}>{data.timestamp}</td>
              </tr>
            </tbody>
          </table>
        </>
      )}
      {data && data.error && <p style={{ color: 'red' }}>{data.error}</p>}
    </div>
  );
};

export default StochasticRsi;
