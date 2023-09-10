FROM node:18-alpine 

#WORKDIR /app
WORKDIR /usr/src/app

#COPY ["<src>", "<dest>"]
COPY ["package.json", "package-lock.json*", "./"]

#NPM install from package.json
RUN npm install

#Copy Anything Source to Working Dir
COPY . .

#Expose the port used in env
EXPOSE 3000

CMD ["node", "server.js"]