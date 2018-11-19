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

const findButtonByBdAddr = async (bdAddr) => {
  if (!bdAddr) {
    throw new Error('invalid argument')
  }

  const button = await Database.buttons.findOne({ where: { bdAddr } })

  if (!button) {
    throw new Error(`Button ${bdAddr} was not found in database`)
  }

  return button
}

const findActionById = async (id) => {
  if (!id) {
    throw new Error('invalid argument')
  }

  const action = await Database.actions.findOne({ where: { id } })

  if (!action) {
    throw new Error(`Action ${id} was not found in database`)
  }

  return action
}

const onButtonSingleClick = async (bdAddr) => {
  Logger.debug(`ButtonUp ${bdAddr}`)

  try {
    const button = await findButtonByBdAddr(bdAddr)

    const actionId = button.singleClickActionId
    const { type, parameters } = await findActionById(actionId)

    switch (type) {
      case 'lifx':
        await LifxWrapper.togglePower(_.get(parameters, 'lightId'))

        break
      default:
        throw new Error(`Action type ${type} is not supported`)
    }
  } catch (error) {
    Logger.warn(error)
  }
}

const onButtonDoubleClick = async (bdAddr) => {
  Logger.debug(`ButtonUp ${bdAddr}`)

  try {
    const button = await findButtonByBdAddr(bdAddr)

    const actionId = button.doubleClickActionId
    const { type, parameters } = await findActionById(actionId)

    switch (type) {
      case 'lifx':
        await LifxWrapper.togglePower(_.get(parameters, 'lightId'))

        break
      default:
        throw new Error(`Action type ${type} is not supported`)
    }
  } catch (error) {
    Logger.warn(error)
  }
}

const onButtonHold = async (bdAddr) => {
  Logger.debug(`ButtonUp ${bdAddr}`)

  try {
    const button = await findButtonByBdAddr(bdAddr)

    const actionId = button.holdActionId
    const { type, parameters } = await findActionById(actionId)

    switch (type) {
      case 'lifx':
        await LifxWrapper.togglePower(_.get(parameters, 'lightId'))

        break
      default:
        throw new Error(`Action type ${type} is not supported`)
    }
  } catch (error) {
    Logger.warn(error)
  }
}

const onButtonDiscovered = async (bdAddr) => {
  try {
    await Database.buttons.findOrCreate({ where: { bdAddr }, defaults: { bdAddr } })
      .spread((button, created) => {
        if (created) {
          Logger.info(`Discovered new button ${button.bdAddr}`)
        }

        return button
      })
  } catch (error) {
    Logger.warn(error)
  }
}

class Actions {
  constructor () {
    LifxWrapper.on('LightOnline', (light) => Logger.info(`LightOnline ${light.id}`))
    LifxWrapper.on('LightOffline', (light) => Logger.info(`LightOffline ${light.id}`))
    LifxWrapper.on('LightDiscovered', (light) => {
      Logger.info(`Discovered new light ${light.id}`)
    })

    FlicWrapper.on('ButtonSingleClick', onButtonSingleClick)
    FlicWrapper.on('ButtonDoubleClick', onButtonDoubleClick)
    FlicWrapper.on('ButtonHold', onButtonHold)
    FlicWrapper.on('ButtonDiscovered', onButtonDiscovered)
  }

  start () {
    LifxWrapper.start()

    FlicWrapper.start()
  }

  stop () {
    FlicWrapper.stop()

    LifxWrapper.stop()
  }
}

module.exports = new Actions()
