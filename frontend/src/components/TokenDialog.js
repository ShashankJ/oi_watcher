import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';
import axios from 'axios';

function TokenDialog({ open, onClose }) {
  const [token, setToken] = useState('');

  const handleSubmit = async () => {
    try {
      await axios.post(`http://desktop-87jr9pk.tail59febf.ts.net?apisession=${token}`);
      alert('Token submitted successfully');
      setToken('');
      onClose();
    } catch (error) {
      console.error('Error submitting token:', error);
      alert('Failed to submit token');
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Set Token</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Token"
          type="text"
          fullWidth
          variant="outlined"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          sx={{ minWidth: '400px', mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TokenDialog;

