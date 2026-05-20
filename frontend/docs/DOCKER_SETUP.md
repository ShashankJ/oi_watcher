# Frontend Docker & API Reverse-Proxy Setup

This document explains the new Docker + nginx reverse-proxy setup for the frontend, which allows seamless API communication in both local development and containerized deployments.

## Architecture Overview

```
┌─────────────────────┐
│  React Frontend     │
│   (SPA Build)       │
└────────┬────────────┘
         │
    ┌────▼────┐
    │  nginx  │  (acts as reverse proxy)
    └────┬────┘
         │
    ┌────▼──────────────────────────────┐
    │  API Backend                       │
    │  - On host: localhost:5000         │
    │  - In Docker: host.docker.internal │
    └────────────────────────────────────┘
```

## How It Works

1. **Frontend Code** (`src/config/axios.js`):
   - Detects runtime environment
   - If `REACT_APP_API_URL` is set → uses it (local dev)
   - If hostname is `localhost` → uses `http://localhost:5000`
   - Otherwise → uses relative path `/` (Docker with nginx proxy)

2. **Nginx Reverse Proxy**:
   - All requests to `/api/*` are proxied to the backend
   - Static files served from `/usr/share/nginx/html`
   - SPA routing handled with `try_files $uri /index.html`

3. **Environment Configuration**:
   - `BACKEND_HOST`: Backend server hostname (default: `host.docker.internal`)
   - `BACKEND_PORT`: Backend server port (default: `5000`)
   - These are substituted into nginx config at container startup via `envsubst`

## Usage Scenarios

### Scenario 1: Local Development on Host Machine

```bash
# Terminal 1: Start backend
cd backend
python main.py

# Terminal 2: Start frontend dev server
cd frontend
npm start
```

**How it works:**
- Frontend dev server runs on `http://localhost:3000`
- `REACT_APP_API_URL=http://desktop-87jr9pk.tail59febf.ts.net:5000` (set in `.env`)
- OR if you change it to `http://localhost:5000`, the dev server can be configured to proxy API calls
- API calls go directly to backend (no nginx needed)

### Scenario 2: Docker Compose - All Services in Containers

```bash
# Build and run everything
docker-compose up --build
```

**Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:8000 (internal Docker network)

**How it works:**
- Frontend container: nginx receives requests on port 80
- `BACKEND_HOST=backend` (Docker service name from compose file)
- `BACKEND_PORT=8000` (backend service port)
- Nginx proxies API calls to `http://backend:8000/api/*`
- Frontend calls relative path `/api/*` which nginx translates to backend

### Scenario 3: Docker on Windows/Mac with Host Backend

If you want to run backend on host but frontend in Docker:

```bash
# Terminal 1: Start backend on host
cd backend
python main.py

# Terminal 2: Build and run frontend container
docker build -t oi-frontend ./frontend
docker run -p 3000:80 \
  -e BACKEND_HOST=host.docker.internal \
  -e BACKEND_PORT=5000 \
  oi-frontend
```

**Access:** http://localhost:3000

**How it works:**
- `host.docker.internal` resolves to the host machine's IP (Windows/Mac Docker Desktop feature)
- Backend runs on host at `localhost:5000` (exposed as `host.docker.internal:5000` to container)
- Nginx inside container proxies `/api` to `host.docker.internal:5000`

### Scenario 4: Docker on Linux with Host Backend

Linux doesn't have `host.docker.internal` by default. Options:

**Option A: Use `docker run --add-host`** (recommended)

```bash
docker run -p 3000:80 \
  --add-host=host.docker.local:host-gateway \
  -e BACKEND_HOST=host.docker.local \
  -e BACKEND_PORT=5000 \
  oi-frontend
```

**Option B: Use explicit IP**

```bash
# Get host IP (on Linux)
HOST_IP=$(hostname -I | awk '{print $1}')

docker run -p 3000:80 \
  -e BACKEND_HOST=$HOST_IP \
  -e BACKEND_PORT=5000 \
  oi-frontend
```

**Option C: Custom docker-compose with extra_hosts**

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - BACKEND_HOST=host.docker.local
      - BACKEND_PORT=5000
    extra_hosts:
      - "host.docker.local:host-gateway"
```

### Scenario 5: Docker on Kubernetes or Remote Host

If your backend is on a different machine:

```bash
docker run -p 3000:80 \
  -e BACKEND_HOST=192.168.1.100 \
  -e BACKEND_PORT=5000 \
  oi-frontend
```

Or in docker-compose:

```yaml
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      - BACKEND_HOST=my-backend.example.com
      - BACKEND_PORT=5000
```

## Configuration Reference

### Environment Variables

| Variable | Default | Used In | Purpose |
|----------|---------|---------|---------|
| `REACT_APP_API_URL` | (empty) | Build/Dev | Absolute backend URL for local dev; ignored in container |
| `BACKEND_HOST` | `host.docker.internal` | Container startup | Backend hostname for nginx reverse-proxy |
| `BACKEND_PORT` | `5000` | Container startup | Backend port for nginx reverse-proxy |

### Files Modified/Created

| File | Purpose |
|------|---------|
| `frontend/src/config/axios.js` | Smart baseURL detection for dev vs container |
| `frontend/Dockerfile` | Multi-stage build + nginx with entrypoint |
| `frontend/docker-entrypoint.sh` | Dynamic nginx config generation |
| `frontend/nginx/default.conf.template` | Nginx config template with environment substitution |
| `frontend/.env` | Local dev environment (REACT_APP_API_URL) |
| `frontend/.env.template` | Documentation of all env vars |
| `docker-compose.yml` | Added `environment` section to frontend service |

## API Call Flow

### Local Development (`npm start`)

```
Browser ──request──> localhost:3000 (dev server)
                        ↓
                    Webpack dev server
                        ↓
                    React App requests /api/endpoint
                        ↓ (REACT_APP_API_URL is set)
                    axios sends to http://desktop-87jr9pk.tail59febf.ts.net:5000/api/endpoint
                        ↓
                    Backend API
```

If you change `REACT_APP_API_URL` to `http://localhost:5000` and enable dev server proxy:

```
Browser ──request──> localhost:3000 (dev server with proxy)
                        ↓
                    React App requests /api/endpoint
                        ↓ (gets translated by dev server proxy)
                    Dev server forwards to http://localhost:5000/api/endpoint
                        ↓
                    Backend API
```

### Docker Container with Reverse-Proxy

```
Browser ──request──> localhost:3000/api/endpoint
                        ↓
                    nginx container (port 3000 → 80)
                        ↓
                    nginx matches /api/ location
                        ↓ (BACKEND_HOST=backend, BACKEND_PORT=8000)
                    nginx proxies to http://backend:8000/api/endpoint
                        ↓
                    Backend container
```

### Localhost API Calls

When dev build runs on non-localhost:

```
Browser ──request──> http://192.168.1.100:3000/api/endpoint
                        ↓
                    React App running in container (or on remote host)
                        ↓
                    axios baseURL is '/' (relative path)
                        ↓
                    Browser makes request to http://192.168.1.100:3000/api/endpoint
                        ↓
                    nginx catches /api/ location
                        ↓
                    nginx proxies to backend
```

## Troubleshooting

### Frontend container can't reach backend

**Symptom:** 502 Bad Gateway or connection refused

**Check:**
```bash
# Verify backend is running
curl http://backend:8000/api/endpoint  # from inside container
docker-compose logs backend  # check backend logs
```

**Solutions:**
- Ensure `docker-compose.yml` has correct `BACKEND_HOST` and `BACKEND_PORT`
- Verify backend container is in same network: `docker network ls && docker network inspect <network>`
- On Linux, verify `--add-host` or `extra_hosts` mapping if using host.docker.local

### API calls to wrong host

**Symptom:** Browser console shows requests to unexpected URL

**Check:**
```javascript
// Open browser console
console.log(window.location.hostname);  // what is the hostname?
// Check axios baseURL
import axiosInstance from './config/axios';
console.log(axiosInstance.defaults.baseURL);
```

**Solutions:**
- Local dev: ensure `REACT_APP_API_URL` is set in `.env`
- Container: verify `BACKEND_HOST` and `BACKEND_PORT` env vars are correct
- Check `docker-entrypoint.sh` ran: `docker logs <container-id> | grep "envsubst\|nginx"`

### CORS errors (even with proxy)

**Symptom:** Browser console shows CORS errors

**Causes:**
- Not using reverse-proxy (calling absolute URL directly)
- nginx proxy not passing correct headers

**Solutions:**
- For dev: don't set `REACT_APP_API_URL` if using relative paths
- For container: ensure axios uses relative `/api` paths
- Check nginx config: `docker exec <container> cat /etc/nginx/conf.d/default.conf`

### nginx config not being generated

**Symptom:** Nginx won't start, "default.conf" not found

**Check:**
```bash
docker logs <frontend-container-id>
```

**Solutions:**
- Verify `docker-entrypoint.sh` is executable: `chmod +x frontend/docker-entrypoint.sh`
- Verify `nginx/default.conf.template` exists in build context
- Verify `gettext` package is installed in Dockerfile
- Check that envsubst syntax is correct: `docker exec <container> which envsubst`

### backend name not resolving in docker-compose

**Symptom:** "Name does not resolve" when accessing backend from frontend

**Check:**
```bash
# From host, inspect network
docker-compose exec frontend nslookup backend
```

**Solutions:**
- Ensure both containers are on same network (they should be by default)
- Restart docker-compose: `docker-compose down && docker-compose up`

## Performance Tips

1. **Enable gzip** in nginx (already configured in template)
2. **Browser caching** for static assets (TTL=1 year, configured in template)
3. **Minimize API calls** - batch requests when possible
4. **Use relative paths** - avoids DNS lookups during dev

## Security Considerations

1. **CORS:** Reverse-proxy avoids CORS issues by serving API from same origin
2. **Sensitive headers:** Verify proxy forwards necessary auth headers (X-Forwarded-*, etc.)
3. **Backend validation:** Always validate requests on backend - don't trust reverse-proxy headers alone
4. **Network:** Use internal Docker networks, not exposed ports for inter-container communication

## Next Steps

1. **Test locally:**
   ```bash
   npm start  # Terminal 1
   # Visit http://localhost:3000, check console for correct API calls
   ```

2. **Test in Docker:**
   ```bash
   docker-compose up --build
   # Visit http://localhost:3000, check Docker logs for nginx messages
   ```

3. **Deploy to production:**
   - Set `BACKEND_HOST` to your production backend hostname
   - Set `BACKEND_PORT` to your production backend port (usually 80 or 443 for HTTP/HTTPS)
   - Consider using HTTPS: update nginx config to use `https://` for proxy_pass

## References

- [Nginx Reverse Proxy Documentation](https://nginx.org/en/docs/http/ngx_http_proxy_module.html)
- [envsubst Substitution](https://man7.org/linux/man-pages/man1/envsubst.1.html)
- [Docker Compose Networking](https://docs.docker.com/compose/networking/)
- [Docker Desktop host.docker.internal](https://docs.docker.com/desktop/networking/)

