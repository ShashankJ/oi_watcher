#!/bin/sh
set -e
# Ensure script uses POSIX sh semantics and Unix line endings.
# Set default values if not provided
BACKEND_HOST=${BACKEND_HOST:-host.docker.internal}
BACKEND_PORT=${BACKEND_PORT:-5000}

# Substitute environment variables in nginx config template
envsubst '$BACKEND_HOST,$BACKEND_PORT' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf

# Start nginx in foreground
exec nginx -g 'daemon off;'