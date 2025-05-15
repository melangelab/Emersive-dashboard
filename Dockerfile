FROM node:16 as build
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Clean and install dependencies
RUN npm cache clean -f

# Important: Install ajv-keywords version compatible with ajv 6.12.6
RUN npm install ajv@6.12.6 --no-save
RUN npm install ajv-keywords@3.5.2 --no-save

# Now install other dependencies with the compatible versions already in place
RUN npm install --legacy-peer-deps

# Copy all source files
COPY . .

# Ensure the buildEnv.js script runs correctly
RUN chmod +x buildEnv.js

# Explicitly set NODE_OPTIONS to increase memory limit
ENV NODE_OPTIONS="--max-old-space-size=8192"

# Run build with explicit ajv version
RUN sed -i 's/"ajv": "\^8\.12\.0"/"ajv": "6.12.6"/g' package.json && \
    npm run build

FROM nginx:alpine
COPY --from=build /usr/src/app/build/ /usr/share/nginx/html

# Add nginx configuration if needed
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]