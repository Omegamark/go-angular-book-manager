FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --silent
COPY . .
# Ensure the environment.apiURL is set to "http://localhost:8080" for browser calls
RUN npm run build -- --configuration production --output-path=dist

# runtime stage - nginx serves built files
FROM nginx:1.25-alpine

# Replace default nginx conf with custom that listens on 4200
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]