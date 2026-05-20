# Stage 1: Build the React application
FROM --platform=linux/amd64 node:16 as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM --platform=linux/amd64 nginx:alpine

# Install gettext for envsubst
RUN apk add --no-cache gettext

# Create nginx templates directory
RUN mkdir -p /etc/nginx/templates

# Copy the build output from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config template
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template

# Copy docker entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Set environment variables with defaults
ENV BACKEND_HOST=host.docker.internal
ENV BACKEND_PORT=5000

# Expose port 80
EXPOSE 80

# Start with entrypoint script
ENTRYPOINT ["/docker-entrypoint.sh"]
