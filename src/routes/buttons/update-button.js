/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const { Route } = require('serverful')

const Joi = require('joi')

const Database = require('../../database')

class UpdateButton extends Route {
  constructor () {
    super('PUT', '/buttons/{id}', 'Buttons', 'Update button')
  }

  async handler ({ params = {}, payload }, h) {
    const { id } = params

    const button = JSON.parse(payload)

    await Database.buttons.update(button, { where: { id } })

    return Database.buttons.find({ where: { id } })
  }

  validate () {
    return {
      params: {
        id: Joi.number()
          .required()
          .description('button id')
      }
    }
  }
}

module.exports = new UpdateButton()
