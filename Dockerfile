FROM node:16-slim as build

COPY package.json yarn.lock /src/tron3/
WORKDIR /src/tron3/

RUN yarn install --non-interactive

COPY . /src/tron3/
RUN yarn build

FROM node:16-slim as deps

COPY package.json yarn.lock /src/tron3/
WORKDIR /src/tron3/

RUN yarn install --non-interactive --prod

# FROM gcr.io/distroless/nodejs:16
FROM node:16-slim

COPY --from=deps /src/tron3/node_modules/ /tron3/node_modules/
COPY --from=build /src/tron3/dist/ /tron3/

WORKDIR /tron3/

ENV CONFIG_PATH /tron3/config.json
ENV COMMANDS_PATH /tron3/commands/

CMD ["index.js"]