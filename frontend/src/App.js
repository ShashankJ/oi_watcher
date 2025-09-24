import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OptionTable from './components/OptionTable';
import OiChart from './components/OiChart';
import Pcr from './components/Pcr';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      // The proxy in package.json will forward this request to the backend
      const response = await axios.get('/api/v1/option-data');
      setData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Is the backend running?');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>OI Watcher</h1>
      </header>
      <main>
        {error && <p className="error">{error}</p>}
        {data && !data.error ? (
          <>
            <Pcr value={data.pcr} />
            <OiChart data={data.oi_chart_data} />
            <OptionTable data={data.contracts} />
          </>
        ) : (
          <p>{data ? data.error : 'Loading...'}</p>
        )}
      </main>
    </div>
  );
}

export default App;
