FROM node:16 as build
WORKDIR /usr/src/app
COPY package*.json ./
COPY resolutions.json ./
RUN npm cache clean -f
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /usr/src/app/build/ /usr/share/nginx/html