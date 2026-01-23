FROM node:20-alpine as build
WORKDIR /app
COPY . /app
RUN npm install
RUN npm run build --prod

FROM nginx:alpine
COPY --from=build /app/dist/currency-frontend /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
