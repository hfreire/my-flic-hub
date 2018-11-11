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
const LifxWrapper = require('./lifx-wrapper')

class Server extends Serverful {
  async start () {
    await super.start()

    await Database.start()

    LifxWrapper.on('LightOnline', (id) => Logger.info(`LightOnline ${id}`))
    LifxWrapper.on('LightOffline', (id) => Logger.info(`LightOffline ${id}`))
    LifxWrapper.on('LightDiscovered', (id) => {
      Logger.info(`Discovered new light ${id}`)
    })
    LifxWrapper.start()

    FlicWrapper.on('ButtonUp', (bdAddr) => Logger.info(`ButtonUp ${bdAddr}`))
    FlicWrapper.on('ButtonDown', (bdAddr) => Logger.info(`ButtonDown ${bdAddr}`))
    FlicWrapper.on('ButtonDiscovered', async (bdAddr) => {
      await Database.buttons.findOrCreate({ where: { bdAddr }, defaults: { bdAddr } })
        .spread((button, created) => {
          if (created) {
            Logger.info(`Discovered new button ${button.bdAddr}`)
          }

          return button
        })
    })
    FlicWrapper.start()
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
