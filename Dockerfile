# build stage
FROM node:14.5-alpine as build-stage

ARG PUBLIC_URL=/

RUN apk --no-cache add autoconf automake libtool make tiff jpeg zlib zlib-dev pkgconf nasm file gcc musl-dev

WORKDIR /app
COPY package.json yarn.lock /app/
RUN yarn install

COPY babel.config.js vue.config.js README.md /app/

COPY ./bin /app/bin
COPY ./build/loaders /app/build/loaders
COPY ./public /app/public
COPY ./translations /app/translations
COPY ./src /app/src

RUN yarn run validateTranslations && VUE_APP_PUBLIC_URL=${PUBLIC_URL} yarn run build

FROM nginx:stable-alpine
RUN mkdir /app
COPY --from=build-stage /app/dist/release /app
COPY nginx.conf /etc/nginx/nginx.conf
