/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const _ = require('lodash')

const Logger = require('modern-logger')

const Database = require('../database')

const FlicWrapper = require('./flic-wrapper')
const Lights = require('./lights')

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

const findClickById = async (id) => {
  if (!id) {
    throw new Error('invalid argument')
  }

  const action = await Database.clicks.findOne({ where: { id } })

  if (!action) {
    throw new Error(`Action ${id} was not found in database`)
  }

  return action
}

const handleClick = async (click) => {
  try {
    switch (click.type) {
      case 'lights':
        await Lights.handleClick(click)

        break
      default:
        throw new Error(`Click type ${click.type} is not supported`)
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

class Clicks {
  constructor () {
    FlicWrapper.on('ButtonSingleClick', async (bdAddr) => {
      const { singleClickId } = await findButtonByBdAddr(bdAddr)
      const click = await findClickById(singleClickId)

      await handleClick(click)
    })
    FlicWrapper.on('ButtonDoubleClick', async (bdAddr) => {
      const { doubleClickId } = await findButtonByBdAddr(bdAddr)
      const click = await findClickById(doubleClickId)

      await handleClick(click)
    })
    FlicWrapper.on('ButtonHold', async (bdAddr) => {
      const { holdId } = await findButtonByBdAddr(bdAddr)
      const click = await findClickById(holdId)

      await handleClick(click)
    })
    FlicWrapper.on('ButtonDiscovered', onButtonDiscovered)
  }

  start () {
    Lights.start()

    FlicWrapper.start()
  }

  stop () {
    FlicWrapper.stop()

    Lights.stop()
  }
}

module.exports = new Clicks()
