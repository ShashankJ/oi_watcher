import React, { useState, useEffect } from 'react';
import axios from 'axios';
import OptionTable from './components/OptionTable';
import OiChart from './components/OiChart';
import Pcr from './components/Pcr';
import SupportResistanceSection from './components/SupportResistanceSection';
import NiftyPrice from './components/NiftyPrice';
import StochasticRsi from './components/StochasticRsi';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      // The proxy in package.json will forward this request to the backend
      //const response = await axios.get('/api/v1/option-data');
      const response = await axios.get('/api/oi_data');
      setData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Is the backend running?');
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Trillionaires (S&A) Formula</h1>
      </header>
      <main>
        {error && <p className="error">{error}</p>}
        {data && !data.error ? (
          <>
            <NiftyPrice value={data['Nifty Price']} />
            <StochasticRsi />
            <Pcr value={data.pcr} />
            <OiChart data={data} />
            <OptionTable data={data} />
            <SupportResistanceSection />
          </>
        ) : (
          <p>{data ? data.error : 'Loading...'}</p>
        )}
      </main>
    </div>
  );
}

export default App;
