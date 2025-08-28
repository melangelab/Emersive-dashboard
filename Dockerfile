FROM node:16-bookworm AS build
WORKDIR /usr/src/app

# Install jq first
RUN apt-get update && apt-get install -y jq && apt-get clean

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Create a temporary modified package.json with correct dependencies
RUN jq '.dependencies["ajv-keywords"] = "3.5.2" | .dependencies["ajv"] = "6.12.6"' package.json > temp.json && \
    mv temp.json package.json

# Clean and install dependencies with force to resolve conflicts
RUN npm cache clean -f
RUN npm install --legacy-peer-deps

# Copy all source files
COPY . .

# Ensure the buildEnv.js script runs correctly
RUN chmod +x buildEnv.js

# Explicitly set NODE_OPTIONS to increase memory limit
ENV NODE_OPTIONS="--max-old-space-size=8192"

# Run build
RUN npm run build

FROM nginx:alpine
COPY --from=build /usr/src/app/build/ /usr/share/nginx/html

# Add nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]