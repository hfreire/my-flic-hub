/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const _ = require('lodash')

const Logger = require('modern-logger')
Logger.configure({ enableEmoji: false })

const Database = require('../database')

const FlicWrapper = require('../flic-wrapper')
const LifxWrapper = require('./lifx-wrapper')

class Actions {
  start () {
    LifxWrapper.on('LightOnline', (light) => Logger.info(`LightOnline ${light.id}`))
    LifxWrapper.on('LightOffline', (light) => Logger.info(`LightOffline ${light.id}`))
    LifxWrapper.on('LightDiscovered', (light) => {
      Logger.info(`Discovered new light ${light.id}`)
    })
    LifxWrapper.start()

    FlicWrapper.on('ButtonUp', async (bdAddr) => {
      Logger.debug(`ButtonUp ${bdAddr}`)

      const button = await Database.buttons.findOne({ where: { bdAddr } })

      if (!button) {
        Logger.warn(`Button ${bdAddr} was not found in database`)

        return
      }

      if (!button.clickActionId) {
        Logger.warn(`Button ${bdAddr} has no click action`)

        return
      }

      const action = await Database.actions.findOne({ where: { id: button.clickActionId } })

      if (!action) {
        Logger.warn(`Action ${button.actionId} was not found in database`)

        return
      }

      Logger.info(`Triggering action ${action.id} for button ${bdAddr} `)

      switch (action.type) {
        case 'lifx':
          await LifxWrapper.togglePower(_.get(action, 'parameters.lightId'))

          break
        default:
          Logger.warn(`Action ${action.type} is not available`)
      }
    })
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

  stop () {
    FlicWrapper.stop()
  }
}

module.exports = Actions
