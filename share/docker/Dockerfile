FROM arm32v6/node:10.13-alpine AS node

# Copy qemu arm binary
COPY --from=hypriot/qemu-register /qemu-arm /usr/bin/qemu-arm-static

# Install base utils
RUN set -x \
  && apk --no-cache add \
    su-exec

FROM node AS build
ARG NAME
ARG NPM_TOKEN

RUN su-exec node mkdir /home/node/$NAME
WORKDIR /home/node/$NAME

# Install npm packages
COPY --chown=node:node package.json package-lock.json .snyk ./
RUN set -x \
  && apk --no-cache add --virtual .npm-deps \
      g++ \
      libc-dev \
      make \
      python \
      git \
  && NODE_ENV= su-exec node npm install sqlite3 --node_sqlite3_binary_host_mirror=https://raw.githubusercontent.com/hfreire/my-flic-hub/master/share/npm/ \
  && NODE_ENV= su-exec node npm ci \
  && apk del .npm-deps

# Build app
COPY --chown=node:node src src/
RUN set -x \
  && su-exec node npm run build --if-present \
  && su-exec node npm prune --production \
  && su-exec node npm cache clean --force

FROM node
LABEL maintainer="hugo@exec.sh"
ARG NAME
ARG VERSION
ARG VERSION_COMMIT
ARG VERSION_BUILD_DATE

# Install base utils
RUN set -x \
  && apk --no-cache add \
    curl \
    netcat-openbsd

RUN su-exec node mkdir /home/node/$NAME
WORKDIR /home/node/$NAME

# Copy app build
COPY --from=build --chown=node:node /home/node/$NAME /home/node/$NAME
COPY --chown=node:node share/flic share/flic/
COPY --chown=node:node share/docker/start.sh start.sh
COPY --chown=node:node share/docker/test.sh test.sh

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
  && mkdir /var/lib/flic \
  && rm -rf /tmp/fliclib-linux-hci-$FLICD_VERSION \
  && rm /tmp/flicd.zip \
  && apk del .flicd-deps

EXPOSE 3000

ENTRYPOINT [ "./start.sh" ]

HEALTHCHECK --start-period=10s --interval=5m --timeout=3s \
  CMD nc -z localhost 3000 || exit 1
