FROM node:8.0.0

WORKDIR /usr/src

COPY package*.json ./

RUN npm install --build-from-source

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]