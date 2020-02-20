/*
 * Copyright (c) 2020, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const { Route } = require('serverful')

const Joi = require('@hapi/joi')

const Database = require('../../database')

class GetClick extends Route {
  constructor () {
    super('GET', '/clicks/{id}', 'Clicks', 'Returns click by id')
  }

  handler ({ params = {} }, h) {
    const { id } = params

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

module.exports = new GetClick()
