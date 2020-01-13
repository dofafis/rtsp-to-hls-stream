FROM node:10

RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get install ffmpeg libavcodec-extra-53

# Create app directory
WORKDIR /rtsp-to-hls-stream

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 8000
CMD [ "node", "server.js" ]