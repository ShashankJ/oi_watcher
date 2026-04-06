import React, { useState } from 'react';
import { CssBaseline, AppBar, Toolbar, Typography, Button } from '@mui/material';
import Dashboard from './Dashboard';
import TokenDialog from './components/TokenDialog';

function App() {
  const [tokenDialogOpen, setTokenDialogOpen] = useState(false);

  return (
    <div className="App">
      <CssBaseline />
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Trillionaires (S&A) Formula
          </Typography>
          <Button
            color="inherit"
            onClick={() => setTokenDialogOpen(true)}
            variant="outlined"
            sx={{ borderColor: 'white' }}
          >
            Set Token
          </Button>
        </Toolbar>
      </AppBar>
      <main>
        <Dashboard />
      </main>
      <TokenDialog
        open={tokenDialogOpen}
        onClose={() => setTokenDialogOpen(false)}
      />
    </div>
  );
}

export default App;
