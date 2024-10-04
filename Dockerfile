FROM alpine:latest
RUN apk update && \
    apk add ffmpeg curl nodejs yarn
COPY package.json /usr/share/hdtv/
WORKDIR /usr/share/hdtv
RUN yarn install
COPY src/ /usr/share/hdtv/src/
ENTRYPOINT [ "yarn", "run", "server" ]
