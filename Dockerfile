# build stage
FROM node:14.5-alpine as build-stage
COPY ./ /app
WORKDIR /app
RUN yarn install && yarn run convertTextures && yarn run compileLangJsons && cp /app/build/lang/* /app/src/lang && yarn run build

FROM nginx:stable-alpine
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf
