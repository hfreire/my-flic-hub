FROM arm32v6/node:10.13-alpine

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

# Copy qemu arm binary
COPY --from=hypriot/qemu-register /qemu-arm /usr/bin/qemu-arm-static

# Create app directory
RUN mkdir -p /home/node/$NAME \
  && chown node:node /home/node/$NAME
WORKDIR /home/node/$NAME

# Install utils
RUN apk --no-cache add \
    su-exec \
    curl \
    netcat-openbsd

# Copy app source
COPY --chown=node:node package.json package.json
COPY --chown=node:node package-lock.json package-lock.json
COPY --chown=node:node src src/
COPY --chown=node:node share/flic share/flic/
COPY --chown=node:node share/docker/start.sh start.sh
COPY --chown=node:node share/docker/test.sh test.sh

# Install npm packages
RUN apk --no-cache add --virtual .npm-deps \
    g++ \
    libc-dev \
    make \
    python \
    git \
  && su-exec node npm install --production \
  && apk del .npm-deps

# Install flicd
ENV FLICD_VERSION 0.5
RUN apk --no-cache add \
    libc6-compat \
  && apk --no-cache add --virtual .flicd-deps \
    unzip \
  && curl -fSL "https://github.com/50ButtonsEach/fliclib-linux-hci/archive/$FLICD_VERSION.zip" -o /tmp/flicd.zip \
  && echo "19a9f6e8ceff648d7314c3dacf4e034cf77843cf760efd2bb850ffc53c254e79 */tmp/flicd.zip" | sha256sum -c - \
  && unzip -d /tmp /tmp/flicd.zip \
  && mv /tmp/fliclib-linux-hci-$FLICD_VERSION/bin/armv6l/flicd /usr/local/bin/flicd \
  && mkdir -p /var/lib/flic \
  && rm -rf /tmp/fliclib-linux-hci-$FLICD_VERSION \
  && rm /tmp/flicd.zip \
  && apk del .flicd-deps

EXPOSE 3000

ENTRYPOINT [ "./start.sh" ]

HEALTHCHECK --start-period=10s --interval=5m --timeout=3s \
  CMD nc -z localhost 3000 || exit 1
