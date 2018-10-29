FROM arm32v6/node:10.11-alpine

MAINTAINER hugo@exec.sh

# Set app runtime environment variables
ARG NPM_TOKEN
ARG NAME
ENV NAME $NAME
ARG VERSION
ENV VERSION $VERSION
ARG VERSION_COMMIT
ENV VERSION_COMMIT $VERSION_COMMIT
ARG VERSION_BUILD_DATE
ENV VERSION_BUILD_DATE $VERSION_BUILD_DATE
ENV FLICD_SHA256 "19a9f6e8ceff648d7314c3dacf4e034cf77843cf760efd2bb850ffc53c254e79"

# Create app directory
ENV HOME /opt/$NAME
RUN mkdir -p $HOME
WORKDIR $HOME

# Install app runtime and build dependencies
RUN apk add --update \
  git \
  netcat-openbsd \
  curl \
  unzip
RUN curl -fSL "https://github.com/50ButtonsEach/fliclib-linux-hci/archive/0.5.zip" -o flicd.zip && \
  echo "$FLICD_SHA256 *flicd.zip" | sha256sum -c - && \
  unzip -d /opt/$NAME flicd.zip
COPY package.json $HOME
RUN npm install --production

# Copy app source
COPY src $HOME/src
COPY share/flic $HOME/share/flic

# Remove app build dependencies
RUN apk del \
  git \
  curl \
  unzip
RUN rm -rf /var/cache/apk/*

COPY share/docker/start.sh /start.sh
RUN chmod +x /start.sh
COPY share/docker/test.sh /test.sh
RUN chmod +x /test.sh

EXPOSE 3000
ENTRYPOINT [ "/start.sh" ]

HEALTHCHECK --start-period=10s --interval=5m --timeout=3s \
  CMD nc -z localhost 3000 || exit 1
