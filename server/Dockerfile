# BUILD
FROM node:alpine as build

WORKDIR /usr/src/app

RUN apk update && apk add g++ python make

COPY ./package.json /usr/src/app/package.json
RUN cd /usr/src/app && npm install

COPY ./data/wordnet.lemmata.json /usr/src/app/data
COPY ./data/wordnet.synsets.json /usr/src/app/data

COPY . /usr/src/app
