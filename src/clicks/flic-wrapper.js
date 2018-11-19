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

const { FlicClient, FlicConnectionChannel, FlicScanWizard } = require('../../share/flic')

const listenToButton = function (bdAddr) {
  if (!bdAddr) {
    throw new Error('invalid arguments')
  }

  this.emit('ButtonDiscovered', bdAddr)

  const connectionChannel = new FlicConnectionChannel(bdAddr)
  this._client.addConnectionChannel(connectionChannel)

  connectionChannel.on('buttonSingleOrDoubleClickOrHold', (clickType, wasQueued, timeDiff) => {
    Logger.debug(`${clickType} ${bdAddr}`)

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

const buildScanWizard = () => {
  const scanWizard = new FlicScanWizard()

  scanWizard.on('foundPrivateButton', () => {
    console.log('Your button is private. Hold down for 7 seconds to make it public.')
  })
  scanWizard.on('foundPublicButton', (bdAddr, name) => {
    console.log('Found public button ' + bdAddr + ' (' + name + '). Now connecting...')
  })
  scanWizard.on('buttonConnected', (bdAddr, name) => {
    console.log('Button connected. Now verifying and pairing...')
  })
  scanWizard.on('completed', (result, bdAddr, name) => {
    console.log('Completed with result: ' + result)
    if (result === 'WizardSuccess') {
      console.log('Your new button is ' + bdAddr)
    }
  })

  return scanWizard
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
    this._client = new FlicClient(_.get(this._options, 'flic.server.host'), _.get(this._options, 'flic.server.port'))

    this._client.once('ready', () => {
      Logger.debug('Connected to flic server')

      this._client.getInfo((info) => info.bdAddrOfVerifiedButtons.forEach((bdAddr) => listenToButton.bind(this)(bdAddr)))

      this._client.on('newVerifiedButton', (bdAddr) => listenToButton.bind(this)(bdAddr))

      this._client.on('bluetoothControllerStateChange', (state) => Logger.info('Bluetooth controller state change: ' + state))

      this._client.on('error', (error) => Logger.error(error))

      this._client.on('close', () => Logger.info('Disconnected from flic server'))
    })

    this._scanWizard = buildScanWizard()
    this._client.addScanWizard(this._scanWizard)
  }

  stop () {
    this._client.cancelScanWizard(this._scanWizard)

    this._client.close()
  }
}

module.exports = new FlicWrapper()
