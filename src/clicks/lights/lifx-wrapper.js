/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const EventEmitter = require('events')

const _ = require('lodash')

const { Client } = require('node-lifx')

const Health = require('health-checkup')

const defaultOptions = {
  lifx: {
    startDiscovery: false,
    lightOfflineTolerance: 16,
    resendMaxTimes: 9
  }
}

class LifxWrapper extends EventEmitter {
  constructor (options = {}) {
    super()

    this._options = _.defaultsDeep({}, options, defaultOptions)

    Health.addCheck('lifx', async () => {
      if (!this._client) {
        throw new Error('Unable to connect to lifx lights')
      }
    })
  }

  start () {
    this._client = new Client()

    this._client.init(_.get(this._options, 'lifx'))

    this._client.on('light-new', (light) => this.emit('LightDiscovered', light))
    this._client.on('light-online', (light) => this.emit('LightOnline', light))
    this._client.on('light-offline', (light) => this.emit('LightOffline', light))

    this._client.startDiscovery()
  }

  stop () {
    this._client.stopDiscovery()
  }

  togglePower (lightId, fadeDuration = 0) {
    return new Promise((resolve, reject) => {
      if (!this._client) {
        reject(new Error('not started'))

        return
      }

      const light = this._client.light(lightId)

      if (!light) {
        reject(new Error(`not light with id ${lightId}`))

        return
      }

      light.getPower((error, power) => {
        if (error) {
          reject(error)

          return
        }

        if (power) {
          light.off(fadeDuration, (error) => {
            if (error) {
              reject(error)

              return
            }

            resolve()
          })
        } else {
          light.on(fadeDuration, (error) => {
            if (error) {
              reject(error)

              return
            }

            resolve()
          })
        }
      })
    })
  }

  powerOn (lightId, fadeDuration = 0, color = {}) {
    return new Promise((resolve, reject) => {
      if (!this._client) {
        reject(new Error('not started'))

        return
      }

      const light = this._client.light(lightId)

      if (!light) {
        reject(new Error(`not light with id ${lightId}`))

        return
      }

      light.getState((error, state) => {
        if (error) {
          reject(error)

          return
        }

        if (!state.power) {
          resolve()
        }

        const { hue, saturation, brightness, kelvin } = _.defaultsDeep({}, color, state.color)

        if (_.isEmpty(color) || _.isEqual(color, state.color)) {
          light.on(fadeDuration, (error) => {
            if (error) {
              reject(error)

              return
            }

            resolve()
          })

          return
        }

        light.color(hue, saturation, brightness, kelvin, fadeDuration, (error) => {
          if (error) {
            reject(error)

            return
          }

          light.on(fadeDuration, (error) => {
            if (error) {
              reject(error)

              return
            }

            resolve()
          })
        })
      })
    })
  }
}

module.exports = new LifxWrapper()
