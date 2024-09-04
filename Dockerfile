FROM node:16.19.1-alpine3.17

WORKDIR /usr/src/app

RUN rm -rf node_modules
RUN rm -rf package-lock.json

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]