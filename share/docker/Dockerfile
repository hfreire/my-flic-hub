FROM arm32v6/node:10.11-alpine

MAINTAINER hugo@exec.sh

# Set runtime environment variables
ARG NPM_TOKEN
ARG NAME
ENV NAME $NAME
ARG VERSION
ENV VERSION $VERSION
ARG VERSION_COMMIT
ENV VERSION_COMMIT $VERSION_COMMIT
ARG VERSION_BUILD_DATE
ENV VERSION_BUILD_DATE $VERSION_BUILD_DATE

# Set work directory
ENV HOME /home/node
WORKDIR $HOME/$NAME

# Copy source
COPY src src/
COPY share/flic share/flic/
COPY share/docker/start.sh start.sh
COPY share/docker/test.sh test.sh

# Install utils
RUN apk --no-cache add --update curl netcat-openbsd

# Install deps
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN apk --no-cache add --virtual .build-deps \
    g++ \
    libc-dev \
    make \
    python \
    git \
  && npm install --production --unsafe-perm \
  && apk del .build-deps \
  && rm package.json \
  && rm package-lock.json

# Install flicd
ENV FLICD_VERSION 0.5
RUN apk --no-cache add --update \
    libc6-compat \
  && apk --no-cache add --virtual .build-deps \
    unzip \
  && curl -fSL "https://github.com/50ButtonsEach/fliclib-linux-hci/archive/$FLICD_VERSION.zip" -o /tmp/flicd.zip \
  && echo "19a9f6e8ceff648d7314c3dacf4e034cf77843cf760efd2bb850ffc53c254e79 */tmp/flicd.zip" | sha256sum -c - \
  && unzip -d /tmp /tmp/flicd.zip \
  && mv /tmp/fliclib-linux-hci-$FLICD_VERSION/bin/armv6l/flicd /usr/local/bin/flicd \
  && mkdir -p /var/lib/flic \
  && rm -rf /tmp/fliclib-linux-hci-$FLICD_VERSION \
  && rm /tmp/flicd.zip \
  && apk del .build-deps

EXPOSE 3000 5551

ENTRYPOINT [ "./start.sh" ]

HEALTHCHECK --start-period=10s --interval=5m --timeout=3s \
  CMD nc -z localhost 3000 || exit 1
