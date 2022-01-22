FROM node:16

# Install dependencies
RUN apt-get update && apt-get install -y \
    python3.4 \
    python3-pip

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# If you are building your code for production
RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 80:8080

EXPOSE 40000-49999:40000-49999/tcp

EXPOSE 40000-49999:40000-49999/udp

CMD [ "node", "index.js" ]
