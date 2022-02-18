FROM node:16

# Install dependencies
RUN apt-get update && apt-get install -y \
    python3.4 \
    python3-pip \
    openssl

# Create app directory
WORKDIR /usr/src/app

# Create SSL certificates
RUN mkdir ssl && \
    cd ssl && \
    openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out server.key && \
    openssl req -new -key server.key -out server.csr \
    -subj "/C=IN/O=6buns/CN=6buns.com" && \
    openssl x509 -req -days 365 -in server.csr -signkey server.key -out server.crt

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 80

EXPOSE 40000-49999/tcp

EXPOSE 40000-49999/udp

CMD [ "node", "index.js" ]
