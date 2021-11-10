FROM node:14-alpine

ENV NODE_ENV=production

RUN apk add --no-cache bash openssl git build-base

RUN npm i -g npm

WORKDIR /usr/src/app

COPY ./scripts/entrypoint.sh ./entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
