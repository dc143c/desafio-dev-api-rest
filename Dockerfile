FROM node:16-alpine
WORKDIR /usr/app
COPY package*.json ./
RUN npm i -g nodemon
RUN npm i
COPY . .

EXPOSE 80
CMD [ "nodemon", "index.js" ]

