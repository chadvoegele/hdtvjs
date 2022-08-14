FROM ubuntu:focal
RUN apt-get update && \
    apt-get install -y ffmpeg curl && \
    curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
    echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list && \
    apt-get update && \
    apt-get install -y yarn
COPY package.json /usr/share/hdtv/
WORKDIR /usr/share/hdtv
RUN yarn install
COPY src/ /usr/share/hdtv/src/
ENTRYPOINT [ "yarn", "run", "server" ]
