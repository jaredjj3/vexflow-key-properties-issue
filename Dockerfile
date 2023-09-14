FROM node:18.3.0

WORKDIR /app

COPY package.json .
COPY yarn.lock .
RUN yarn install

COPY src src

CMD [ "yarn", "jest" ]