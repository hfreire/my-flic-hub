/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const { Serverful } = require('serverful')

const Logger = require('modern-logger')
Logger.configure({ enableEmoji: false })

const Database = require('./database')
const FlicWrapper = require('./flic-wrapper')
const Clicks = require('./clicks')

class Server extends Serverful {
  async start () {
    await Database.start()

    FlicWrapper.start()

    Clicks.start()

    return super.start()
  }

  async stop () {
    await super.stop()

    Clicks.stop()

    FlicWrapper.stop()

    return Database.stop()
  }
}

module.exports = new Server()
