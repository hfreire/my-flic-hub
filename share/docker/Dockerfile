FROM arm32v6/node:16.5.0-alpine AS node

# Copy qemu arm binary
COPY --from=hypriot/qemu-register /qemu-arm /usr/bin/qemu-arm-static

# Install base utils
RUN set -x \
  && apk --no-cache add \
    su-exec \
    curl \
    netcat-openbsd

# Install flicd
ENV FLICD_VERSION 2.0.2
RUN apk --no-cache add \
    libc6-compat \
  && apk --no-cache add --virtual .flicd-deps \
    unzip \
  && curl -fSL "https://github.com/50ButtonsEach/fliclib-linux-hci/archive/$FLICD_VERSION.zip" -o /tmp/flicd.zip \
  && echo "e1da77d45ab77d77d3aba50180d697fcb208a19517cde87b5295fc474fd1e7b6 */tmp/flicd.zip" | sha256sum -c - \
  && unzip -d /tmp /tmp/flicd.zip \
  && mv /tmp/fliclib-linux-hci-$FLICD_VERSION/bin/armv6l/flicd /usr/local/bin/flicd \
  && mkdir /var/lib/flic \
  && rm -rf /tmp/fliclib-linux-hci-$FLICD_VERSION \
  && rm /tmp/flicd.zip \
  && apk del .flicd-deps

FROM node AS prebuild

RUN apk --no-cache add \
    g++ \
    libc-dev \
    make \
    python \
    git

FROM prebuild AS build
ARG NAME
ARG NPM_TOKEN

RUN su-exec node mkdir /home/node/$NAME
WORKDIR /home/node/$NAME

# Install npm packages
COPY --chown=node:node package.json package-lock.json .snyk ./
RUN set -x \
  && NODE_ENV= su-exec node npm ci

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

RUN su-exec node mkdir /home/node/$NAME
WORKDIR /home/node/$NAME

# Copy app build
COPY --from=build --chown=node:node /home/node/$NAME /home/node/$NAME
COPY --chown=node:node share/flic share/flic/
COPY --chown=node:node share/docker/start.sh start.sh
COPY --chown=node:node share/docker/test.sh test.sh

ENV NAME $NAME
ENV VERSION $VERSION
ENV VERSION_COMMIT $VERSION_COMMIT
ENV VERSION_BUILD_DATE $VERSION_BUILD_DATE

EXPOSE 3000

ENTRYPOINT [ "./start.sh" ]

HEALTHCHECK --start-period=10s --interval=5m --timeout=3s \
  CMD nc -z localhost 3000 || exit 1
