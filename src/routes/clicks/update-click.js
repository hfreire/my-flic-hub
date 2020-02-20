/*
 * Copyright (c) 2020, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const { Route } = require('serverful')

const Joi = require('@hapi/joi')

const Database = require('../../database')

class UpdateClick extends Route {
  constructor () {
    super('PUT', '/clicks/{id}', 'Clicks', 'Update click')
  }

  async handler ({ params = {}, payload }, h) {
    const { id } = params

    const button = JSON.parse(payload)

    await Database.clicks.update(button, { where: { id } })

    return Database.clicks.find({ where: { id } })
  }

  validate () {
    return Joi.object({
      params: {
        id: Joi.number()
          .required()
          .description('button id')
      }
    })
  }
}

module.exports = new UpdateClick()
