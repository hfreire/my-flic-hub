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

class Server extends Serverful {
  async start () {
    await super.start()

    await Database.start()

    FlicWrapper.start()
    FlicWrapper.on('ButtonUp', (bdAddr) => Logger.info(`ButtonUp ${bdAddr}`))
    FlicWrapper.on('ButtonDown', (bdAddr) => Logger.info(`ButtonDown ${bdAddr}`))
  }

  async stop () {
    try {
      FlicWrapper.stop()
    } catch (error) {
      Logger.error(error)
    }

    await super.stop()
  }
}

module.exports = new Server()
