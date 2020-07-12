# build stage
FROM node:10 as build-stage
COPY ./ /app
WORKDIR /app
RUN yarn install && yarn run build

FROM nginx:stable-alpine
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf
