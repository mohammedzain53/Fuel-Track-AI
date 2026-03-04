# ---------- 1. Build Stage ----------
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files first (better caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Build React app
RUN npm run build



# ---------- 2. Production Stage ----------
FROM nginx:stable-alpine

# Remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*

# Copy React build to NGINX
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]
