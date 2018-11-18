/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const NAME = process.env.NAME

const _ = require('lodash')

const Sequelize = require('sequelize')

const { mkdirSync, statSync } = require('fs')
const { join } = require('path')

const defaultOptions = {
  database: {
    pathDir: join(__dirname, '../tmp'),
    filename: `${NAME}.db`
  }
}

class Database {
  constructor (options = {}) {
    this._options = _.defaultsDeep({}, options, defaultOptions)

    this._sequelize = new Sequelize(null, null, null, {
      dialect: 'sqlite',
      pool: { max: 5, min: 0, idle: 10000 },
      storage: `${this._options.database.pathDir}/${this._options.database.filename}`,
      logging: false
    })

    this._models = {
      buttons: this._sequelize.define('buttons', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        bdAddr: { type: Sequelize.STRING, allowNull: false },
        clickActionId: { type: Sequelize.INTEGER },
        doubleClickActionId: { type: Sequelize.INTEGER },
        holdActionId: { type: Sequelize.INTEGER }
      }),
      actions: this._sequelize.define('actions', {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        type: { type: Sequelize.STRING, allowNull: false },
        parameters: {
          type: Sequelize.TEXT,
          defaultValue: null,
          get: function () {
            return !this.getDataValue('parameters') ? null : JSON.parse(this.getDataValue('parameters'))
          },
          set: function (value) {
            this.setDataValue('parameters', value === null ? null : JSON.stringify(value))
          }
        }
      })
    }
  }

  get buttons () {
    return this._models[ 'buttons' ]
  }

  get actions () {
    return this._models[ 'actions' ]
  }

  async start () {
    if (this._started) {
      return
    }

    try {
      statSync(this._options.database.pathDir)
    } catch (ignored) {
      mkdirSync(this._options.database.pathDir)
    }

    await this._sequelize.authenticate()

    _.forEach(_.keys(this._models), async (modelName) => this._models[ modelName ].sync())

    this._started = true
  }

  async stop () {
    if (!this._started) {
      return
    }

    delete this._started

    return this._sequelize.close()
  }
}

module.exports = new Database()
