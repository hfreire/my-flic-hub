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
    startDiscovery: false
  }
}

class LifxWrapper extends EventEmitter {
  constructor (options = {}) {
    super()

    this._options = _.defaultsDeep({}, options, defaultOptions)

    this._client = new Client(_.get(this._options, 'lifx'))

    this._client.init()

    this._client.on('light-new', (light) => this.emit('LightDiscovered', light))
    this._client.on('light-online', (light) => this.emit('LightOnline', light))
    this._client.on('light-offline', (light) => this.emit('LightOffline', light))

    Health.addCheck('lifx', async () => {
      if (!this._client) {
        throw new Error('Unable to connect to lifx lights')
      }
    })
  }

  start () {
    this._client.startDiscovery()
  }

  stop () {
    this._client.stopDiscovery()
  }
}

module.exports = new LifxWrapper()
