# Backend API Configuration Guide

## Overview
This project uses a centralized axios configuration to manage all API calls to the backend server. This makes it easy to change the backend URL without modifying multiple files.

## How It Works

### 1. Centralized Axios Configuration
All API calls use a pre-configured axios instance located at:
```
frontend/src/config/axios.js
```

This file creates an axios instance with:
- Base URL from environment variables
- Request/response interceptors for logging and error handling
- Default timeout and headers

### 2. Environment Variables
The backend URL is stored in the `.env` file:
```
frontend/.env
```

Current configuration:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 3. Component Import
All components import the configured axios instance based on their location:

**For files in `src/` directory (e.g., Dashboard.js):**
```javascript
import axios from './config/axios';
```

**For files in `src/components/` directory:**
```javascript
import axios from '../config/axios';
```

## How to Change the Backend Server URL

### Method 1: Using Environment Variables (Recommended)

**For Development:**
1. Edit `frontend/.env`:
   ```env
   REACT_APP_API_URL=http://your-backend-server:port
   ```
2. Restart the React development server:
   ```powershell
   cd frontend
   npm start
   ```

**For Production:**
1. Set the environment variable before building:
   ```powershell
   $env:REACT_APP_API_URL="https://your-production-api.com"
   npm run build
   ```
   
   Or create a `.env.production` file:
   ```env
   REACT_APP_API_URL=https://your-production-api.com
   ```

### Method 2: Direct Configuration File Edit

Edit `frontend/src/config/axios.js` and change the fallback URL:
```javascript
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://your-default-backend:port',
  // ...
});
```

## Examples

### Local Backend
```env
REACT_APP_API_URL=http://localhost:5000
```

### Remote Backend (IP Address)
```env
REACT_APP_API_URL=http://192.168.1.100:5000
```

### Remote Backend (Domain)
```env
REACT_APP_API_URL=https://api.yourdomain.com
```

### Different Port
```env
REACT_APP_API_URL=http://localhost:8080
```

## API Endpoints Used

The application makes calls to the following endpoints:
- `/api/oi_data` - Main OI data (Dashboard)
- `/api/nifty_previous_day` - Previous day OHLC data
- `/stochrsi_nifty50_5m` - Stochastic RSI data
- `/support_resistance` - Support and resistance levels

All these endpoints are automatically prefixed with the base URL from the configuration.

## Debugging

The axios configuration includes interceptors that log all requests and errors to the browser console.

To see the API calls:
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. You'll see logs like:
   ```
   Making GET request to: http://localhost:5000/api/oi_data
   ```

## Troubleshooting

### Issue: "Failed to fetch data. Is the backend running?"
**Solutions:**
1. Verify the backend server is running
2. Check the URL in `.env` is correct
3. Check browser console for the actual URL being called
4. Ensure no firewall is blocking the connection

### Issue: CORS Errors
**Solution:** Ensure your backend has CORS enabled for the frontend origin.

### Issue: Changes not taking effect
**Solution:** 
1. Stop the React development server (Ctrl+C)
2. Clear the build cache: `npm cache clean --force`
3. Restart: `npm start`

## Notes

- Environment variables must start with `REACT_APP_` to be accessible in React
- The `.env` file is loaded when the development server starts
- Changes to `.env` require restarting the development server
- The `.env` file should be in `.gitignore` if it contains sensitive data
- For production, set environment variables on your hosting platform

