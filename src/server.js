/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const { Serverful } = require('serverful')

const FlicWrapper = require('./flic-wrapper')

class Server extends Serverful {
  async start () {
    await super.start()

    FlicWrapper.start()
  }

  async stop () {
    FlicWrapper.stop()

    await super.stop()
  }
}

module.exports = new Server()
