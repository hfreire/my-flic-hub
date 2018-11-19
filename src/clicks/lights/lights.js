/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const _ = require('lodash')

const Logger = require('modern-logger')

const LifxWrapper = require('./lifx-wrapper')

class Lights {
  constructor () {
    LifxWrapper.on('LightOnline', (light) => Logger.info(`LightOnline ${light.id}`))
    LifxWrapper.on('LightOffline', (light) => Logger.info(`LightOffline ${light.id}`))
    LifxWrapper.on('LightDiscovered', (light) => Logger.info(`Discovered new light with id ${light.id}`))
  }

  handleClick (click) {
    const { action, data } = click

    const promises = _.map(data, ({ lightId, fadeDuration, color }) => {
      if (_.has(LifxWrapper, action)) {
        return Promise.reject(new Error(`Lights action ${action} not supported`))
      }

      return LifxWrapper[ action ](lightId, fadeDuration, color)
    })

    return Promise.all(promises)
  }

  start () {
    LifxWrapper.start()
  }

  stop () {
    LifxWrapper.stop()
  }
}

module.exports = new Lights()
