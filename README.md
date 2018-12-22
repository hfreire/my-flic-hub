# My :dizzy: own flic hub for the :earth_africa: world's smartest :red_circle: button

[![Build Status](https://travis-ci.org/hfreire/my-flic-hub.svg?branch=master)](https://travis-ci.org/hfreire/my-flic-hub)
[![Coverage Status](https://coveralls.io/repos/github/hfreire/my-flic-hub/badge.svg?branch=master)](https://coveralls.io/github/hfreire/my-flic-hub?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/hfreire/my-flic-hub/badge.svg)](https://snyk.io/test/github/hfreire/my-flic-hub)
[![](https://img.shields.io/github/release/hfreire/my-flic-hub.svg)](https://github.com/hfreire/my-flic-hub/releases)
[![Docker Stars](https://img.shields.io/docker/stars/hfreire/my-flic-hub.svg)](https://hub.docker.com/r/hfreire/my-flic-hub/)
[![Docker Pulls](https://img.shields.io/docker/pulls/hfreire/my-flic-hub.svg)](https://hub.docker.com/r/hfreire/my-flic-hub/) 

> Use a [Raspberry Pi](https://www.raspberrypi.org) to control all your home flic buttons without the [flic app](https://itunes.apple.com/us/app/flic-app/id977593793) or a [flic hub](https://flic.io/flic-hub).

### How to use

#### Use it in your terminal
Using it in your terminal requires [Docker](https://www.docker.com) installed in your system.

##### Run the Docker image in a container 
Detach from the container and use the host's network stack.
```
docker run -d --cap-add NET_ADMIN --net=host hfreire/my-flic-hub
```

#### Available REST API endpoints
Swagger documentation available at `http://localhost:3000/docs`.

#### Available usage environment variables
Variable | Description | Required | Default value
:---:|:---:|:---:|:---:
PORT | The port to be used by the HTTP server. | false | `3000`
API_KEYS | The secret keys that should be used when securing endpoints. | false | `undefined`
SO_TIMEOUT | TCP socket connection timeout. | false | `120000`
BASE_PATH | Base path to be prefixed to all available endpoint paths. | false | `/`
PING_PATH | Endpoint path for pinging app. | false | `/ping`
HEALTHCHECK_PATH | Endpoint for checking app health. | false | `/healthcheck`
LOG_LEVEL | The log level verbosity. | false | `info`
ENVIRONMENT | The environment the app is running on. | false | `undefined`
ROLLBAR_API_KEY | The server API key used to talk with Rollbar. | false | `undefined`

### How to build
##### Clone the GitHub repo
```
git clone https://github.com/hfreire/my-flic-hub.git
```

##### Change current directory
```
cd my-flic-hub
```

##### Run the NPM script that will build the Docker image
```
npm run build
```

### How to contribute
You can contribute either with code (e.g., new features, bug fixes and documentation) or by [donating 5 EUR](https://paypal.me/hfreire/5). You can read the [contributing guidelines](CONTRIBUTING.md) for instructions on how to contribute with code. 

All donation proceedings will go to the [Sverige för UNHCR](https://sverigeforunhcr.se), a swedish partner of the [UNHCR - The UN Refugee Agency](http://www.unhcr.org), a global organisation dedicated to saving lives, protecting rights and building a better future for refugees, forcibly displaced communities and stateless people.

### License
Read the [license](./LICENSE.md) for permissions and limitations.
