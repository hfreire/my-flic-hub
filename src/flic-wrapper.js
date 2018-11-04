/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const SERVER_HOST = process.env.FLIC_SERVER_HOST || 'localhost'
const SERVER_PORT = process.env.FLIC_SERVER_PORT || 5551

const EventEmitter = require('events')

const _ = require('lodash')

const Logger = require('modern-logger')
const Health = require('health-checkup')

const { FlicClient, FlicConnectionChannel } = require('../share/flic')

const listenToButton = function (bdAddr) {
  if (!bdAddr) {
    throw new Error('invalid arguments')
  }

  const connectionChannel = new FlicConnectionChannel(bdAddr)
  this._client.addConnectionChannel(connectionChannel)

  connectionChannel.on('buttonUpOrDown', (clickType, wasQueued, timeDiff) => {
    if (wasQueued) {
      Logger.debug(`Discarding ${clickType} from button ${bdAddr} because it was queued`)

      return
    }

    if (timeDiff > 3) {
      Logger.debug(`Discarding ${clickType} from button ${bdAddr} because the time difference was ${timeDiff}`)

      return
    }

    this.emit(clickType, bdAddr)
  })

  connectionChannel.on('connectionStatusChanged', (connectionStatus, disconnectReason) => {
    Logger.debug(bdAddr + ' ' + connectionStatus + (connectionStatus === 'Disconnected' ? ' ' + disconnectReason : ''))
  })
}

const defaultOptions = {
  flic: {
    server: {
      host: SERVER_HOST,
      port: SERVER_PORT
    }
  }
}

class FlicWrapper extends EventEmitter {
  constructor (options = {}) {
    super()

    this._options = _.defaultsDeep({}, options, defaultOptions)

    Health.addCheck('flic', async () => {
      if (!this._client) {
        throw new Error('Unable to connect to flic daemon')
      }
    })
  }

  start () {
    if (this._client) {
      return
    }

    this._client = new FlicClient(_.get(this._options, 'flic.server.host'), _.get(this._options, 'flic.server.port'))

    this._client.once('ready', () => {
      Logger.info('Connected to flic server!')

      this._client.getInfo((info) => info.bdAddrOfVerifiedButtons.forEach((bdAddr) => listenToButton.bind(this)(bdAddr)))

      this._client.on('bluetoothControllerStateChange', (state) => Logger.info('Bluetooth controller state change: ' + state))

      this._client.on('newVerifiedButton', (bdAddr) => {
        Logger.info('A new button was added: ' + bdAddr)

        this.listenToButton.bind(this)(bdAddr)
      })

      this._client.on('error', (error) => Logger.error(error))

      this._client.on('close', (hadError) => {
        Logger.info('Connection to daemon is now closed')
      })
    })
  }

  stop () {
    if (!this._client) {
      return
    }

    this._client.close()
  }
}

module.exports = new FlicWrapper()
