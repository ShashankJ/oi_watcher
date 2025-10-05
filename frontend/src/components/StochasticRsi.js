import React, { useEffect, useState } from 'react';

const StochasticRsi = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/stochrsi_nifty50_5m')
      .then((res) => res.json())
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch Stochastic RSI');
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ marginTop: 24, border: '1px solid #ccc', borderRadius: 8, padding: 16, maxWidth: 400 }}>
      <h2>Stochastic RSI (Nifty 50, 5m)</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {data && !data.error && (
        <>
          <h3>{data.stochrsi !== undefined ? data.stochrsi.toFixed(2) : 'N/A'}</h3>
          <p>{data.analysis}</p>
        </>
      )}
      {data && data.error && <p style={{ color: 'red' }}>{data.error}</p>}
    </div>
  );
};

export default StochasticRsi;

