FROM node:16 as build
WORKDIR /usr/src/app

# Copy package files first for better caching
COPY package.json package-lock.json ./

# Create resolutions.json with the specific ajv version
RUN echo '{"ajv":"6.12.6"}' > resolutions.json

# Clean and install dependencies
RUN npm cache clean -f
RUN npm install --legacy-peer-deps

# Copy all source files
COPY . .

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