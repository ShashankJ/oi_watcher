# OI Watcher - Quick Reference

## Change Backend URL

**Edit this file:** `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:5000
```

Change to your backend URL, then restart frontend:
```powershell
cd frontend
npm start
```

## Start Backend Server

```powershell
cd backend
python server.py
```

Backend runs on: `http://0.0.0.0:5000`

## Start Frontend

```powershell
cd frontend
npm start
```

Frontend runs on: `http://localhost:3000`

## Check Backend Status

```powershell
# Check if running
netstat -ano | findstr :5000

# Test API
Invoke-WebRequest -Uri "http://localhost:5000/stochrsi_nifty50_5m"
```

## API Endpoints

- `/api/oi_data` - Main OI data
- `/api/nifty_previous_day` - Previous day OHLC
- `/stochrsi_nifty50_5m` - Stochastic RSI
- `/support_resistance?interval=15&unit=minute` - Support/Resistance

## Troubleshooting

### Frontend can't connect to backend
1. Check backend is running: `netstat -ano | findstr :5000`
2. Check URL in `frontend/.env`
3. Restart both frontend and backend

### Timeout errors
- Normal during market hours when fetching live data
- Timeout is set to 60 seconds
- Backend may take time to fetch data from multiple sources

### CORS errors
- Already fixed! CORS is enabled in backend
- If still seeing errors, restart backend

## File Locations

**Frontend Config:**
- `frontend/.env` - Backend URL configuration
- `frontend/src/config/axios.js` - Axios configuration

**Backend:**
- `backend/server.py` - Flask server with CORS enabled
- `backend/requirements.txt` - Python dependencies

## Documentation

- `frontend/BACKEND_CONFIG.md` - Complete configuration guide
- `frontend/.env.example` - Configuration examples

