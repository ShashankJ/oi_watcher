import React from 'react';
import { CssBaseline, AppBar, Toolbar, Typography } from '@mui/material';
import Dashboard from './Dashboard';

function App() {
  return (
    <div className="App">
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Trillionaires (S&A) Formula
          </Typography>
        </Toolbar>
      </AppBar>
      <main>
        <Dashboard />
      </main>
    </div>
  );
}

export default App;
