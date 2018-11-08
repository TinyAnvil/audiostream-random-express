FROM node:10-alpine

# Set the working direcrory to `/usr/src`
WORKDIR /usr/src

# Installs latest Chromium (68) package.
RUN apk update && apk upgrade && \
    apk add --no-cache \
      alsa-utils \
      alsa-lib

# Copy the package.json and yarn.lock files into the image and run `yarn` to install dependencies
COPY package.json yarn.lock /usr/src/

RUN yarn

# Copy the remaining source files into the image
COPY . .
RUN yarn build

# Clear the cache
RUN yarn cache clean

EXPOSE 4000
CMD [ "yarn", "start", "--hostname", "0.0.0.0"]

# docker build --no-cache -t audiostream-random-express .
# docker stop audiostream-random-express ; docker run -d -it --rm -p 3030:4000 --device /dev/snd --name audiostream-random-express audiostream-random-express
# docker exec -it audiostream-random-express /bin/bash
# docker logs --follow audiostream-random-express
