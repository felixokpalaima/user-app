FROM node:16-alpine3.18

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

EXPOSE 3000

CMD [ "node", "app.js" ]
