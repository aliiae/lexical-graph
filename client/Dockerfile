# BUILD
FROM node:alpine as build

WORKDIR /usr/src/app

RUN apk update && apk add g++ python make git

COPY ./package.json /usr/src/app/package.json
RUN cd /usr/src/app && npm install

COPY . /usr/src/app
#RUN cd /usr/src/app && npm run build
