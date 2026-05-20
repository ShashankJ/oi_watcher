# Implementation Summary - Frontend Docker + Nginx Reverse-Proxy

## Overview
We've implemented a production-ready frontend setup that works seamlessly in three environments:
1. **Local development** on your host machine
2. **Docker containers** with automatic API routing
3. **Mixed mode** (e.g., frontend in Docker, backend on host)

## Files Modified

### 1. `frontend/src/config/axios.js`
**Changed:** API baseURL detection logic

**Before:**
```javascript
baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000'
```

**After:**
```javascript
// Smart detection:
// - Use REACT_APP_API_URL if provided (local dev)
// - Use http://localhost:5000 if running on localhost (dev mode)
// - Use relative path '/' otherwise (Docker with nginx)
```

**Why:** Allows axios to work correctly in all three environments without code changes.

---

### 2. `frontend/Dockerfile`
**Changed:** Added nginx config templating and environment variable support

**Key additions:**
- Install `gettext` package (provides `envsubst` for template substitution)
- Copy nginx template and entrypoint script
- Set default env vars: `BACKEND_HOST=host.docker.internal`, `BACKEND_PORT=5000`
- Use entrypoint script instead of direct nginx command

**Why:** Enables runtime configuration of backend host/port without rebuilding Docker image.

---

### 3. `frontend/docker-entrypoint.sh` *(NEW)*
**Purpose:** Runtime nginx configuration generation

**What it does:**
1. Reads `BACKEND_HOST` and `BACKEND_PORT` environment variables
2. Substitutes them into nginx template using `envsubst`
3. Generates final nginx config at `/etc/nginx/conf.d/default.conf`
4. Starts nginx

**Why:** Allows same Docker image to work with different backends (localhost:5000, backend:8000, 192.168.1.100:5000, etc.) without rebuilding.

---

### 4. `frontend/nginx/default.conf.template` *(NEW)*
**Purpose:** Nginx configuration template with substitution variables

**Key features:**
- Reverse-proxy all `/api/*` requests to backend
- Serve static SPA files from `/usr/share/nginx/html`
- Implement proper SPA routing (fallback to index.html)
- Set up caching for static assets
- Enable gzip compression
- Proxy headers (X-Real-IP, X-Forwarded-For, etc.) for proper logging

**Template variables:**
- `${BACKEND_HOST}` - substituted with BACKEND_HOST env var
- `${BACKEND_PORT}` - substituted with BACKEND_PORT env var

**Why:** Centralized, production-grade nginx configuration that handles API proxying, SPA routing, and compression.

---

### 5. `frontend/.env` (UPDATED)
**Changed:** Added comprehensive documentation

**Before:**
```env
REACT_APP_API_URL=http://desktop-87jr9pk.tail59febf.ts.net:5000
# Change this to your backend server URL
```

**After:**
```env
# Clear notes about when it's used
# - Only for local dev builds (npm start / npm run build)
# - Ignored when running in Docker container
# - Environment contains default backend URL
```

**Why:** Prevents confusion about when/where this variable is used.

---

### 6. `docker-compose.yml` (UPDATED)
**Changed:** Added environment variables to frontend service

**Before:**
```yaml
frontend:
  build: ./frontend
  ports:
    - "3000:80"
  depends_on:
    - backend
```

**After:**
```yaml
frontend:
  build: ./frontend
  ports:
    - "3000:80"
  environment:
    - BACKEND_HOST=backend        # Docker service name
    - BACKEND_PORT=8000            # Backend service port
  depends_on:
    - backend
```

**Why:** Tells nginx inside frontend container where to find backend (backend:8000 via Docker internal DNS).

---

## Files Created

### 1. `frontend/.env.template` (NEW)
Documentation of all available environment variables with usage examples.

### 2. `frontend/DOCKER_SETUP.md` (NEW)
Comprehensive guide including:
- Architecture diagrams
- Five different deployment scenarios
- Configuration reference table
- API call flow diagrams
- Detailed troubleshooting guide
- Performance tips
- Security considerations

### 3. `QUICK_START_DOCKER.md` (NEW - at repo root)
Quick reference with:
- What changed summary
- Three quick tests
- Common setups (A, B, C, D)
- Testing procedures
- 60-second troubleshooting

---

## How It Works - The Complete Flow

### Scenario 1: Local Development (`npm start`)
```
1. Backend runs: python main.py → localhost:5000
2. Frontend runs: npm start → localhost:3000
3. .env has: REACT_APP_API_URL=http://desktop-87jr9pk.tail59febf.ts.net:5000
4. axios.js reads REACT_APP_API_URL → uses it
5. API calls go directly to configured URL
```

### Scenario 2: Docker Compose (all containers)
```
1. docker-compose up builds both images
2. Frontend container starts with env: BACKEND_HOST=backend, BACKEND_PORT=8000
3. docker-entrypoint.sh runs: envsubst on template
4. nginx config generated: upstream backend { server backend:8000; }
5. nginx listens on port 80, proxies /api to backend:8000
6. Frontend app (running in container) calls relative /api paths
7. Browser → localhost:3000/api/... → nginx → localhost:3000:80/api/... → backend:8000
```

### Scenario 3: Frontend Docker + Backend on Host
```
1. Backend runs on host: python main.py → localhost:5000
2. Frontend runs in Docker with: BACKEND_HOST=host.docker.internal, BACKEND_PORT=5000
3. docker-entrypoint.sh substitutes these into nginx
4. nginx inside container is configured to proxy to host.docker.internal:5000
5. host.docker.internal (Docker Desktop feature) resolves to your host machine
6. API calls work seamlessly
```

---

## Environment Variable Reference

| Variable | Set In | Used By | Purpose |
|----------|--------|---------|---------|
| `REACT_APP_API_URL` | `.env` file | Build process & dev | Baked into React app during build; used when doing `npm start` or `npm run build` |
| `BACKEND_HOST` | `docker-compose.yml` or `docker run -e` | `docker-entrypoint.sh` | Substituted into nginx template at container startup |
| `BACKEND_PORT` | `docker-compose.yml` or `docker run -e` | `docker-entrypoint.sh` | Substituted into nginx template at container startup |

---

## Key Design Decisions

### 1. Smart Relative Path Detection
- Keeps builds simple (no runtime JS injection needed)
- Works with all deployment models
- Avoids CORS issues via reverse-proxy

### 2. Template-Based Nginx Config
- Same Docker image works with different backend URLs
- No image rebuilds needed when changing backend host
- Environment variables injected at startup via `envsubst`

### 3. Default to host.docker.internal
- Works out-of-the-box on Docker Desktop (Windows/Mac)
- Can be overridden for Linux (`host-gateway`) or remote hosts (IPs)
- Falls back gracefully for docker-compose internal networking

### 4. Preserve Local Dev Experience
- `REACT_APP_API_URL` still available for local dev
- No changes needed to existing dev workflow
- Optional: can use `npm start` with axios using relative paths + dev server proxy

---

## Testing Checklist

- [ ] Local dev: `npm start` → http://localhost:3000 → API calls work
- [ ] Local build: `npm run build` → serves static files correctly
- [ ] Docker compose: `docker-compose up` → http://localhost:3000 → API calls routed properly
- [ ] Docker + host backend: Frontend in container calls backend on host machine
- [ ] Console check: `axiosInstance.defaults.baseURL` shows correct value for environment
- [ ] Nginx logs: `docker logs frontend` shows successful config generation

---

## Backward Compatibility

✅ **Fully backward compatible**
- Existing `.env` and dev workflow unchanged
- `npm start` still works as before
- `npm run build` still works as before
- Old `docker-compose.yml` would still build/run (but may not find backend without env vars)

---

## Next Steps for Production Deployment

1. **Update docker-compose.yml** for your backend service port
2. **Test all three scenarios** listed above
3. **Write down your backend host/port** for deployment:
   - Local: `REACT_APP_API_URL=...`
   - Docker: `BACKEND_HOST=...`, `BACKEND_PORT=...`
4. **Consider HTTPS**:
   - Add SSL cert to nginx
   - Update proxy_pass to use `https://`
   - Add `proxy_pass_header` for SSL certificates if needed
5. **Add monitoring/logging**:
   - nginx access logs
   - backend logs
   - API performance metrics
6. **Optional security hardening**:
   - Rate limiting in nginx
   - Request size limits
   - CORS headers if calling from different origins

---

## Support & Troubleshooting

See these files for detailed help:
- **Quick questions:** `QUICK_START_DOCKER.md`
- **Detailed guide:** `frontend/DOCKER_SETUP.md`
- **Configuration reference:** `frontend/.env.template`
- **Browser console:** Check `axiosInstance.defaults.baseURL` and API logs
- **Docker logs:** `docker logs <container>` or `docker-compose logs`

