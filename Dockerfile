FROM node:12-alpine

ADD package.json yarn.lock /app/
WORKDIR /app
RUN ["yarn", "install", "--production"]

ADD ./dist ./

ENV CONFIG_PATH ./config.json
ENV COMMANDS_PATH ./commands

CMD ["node", "index.js"]