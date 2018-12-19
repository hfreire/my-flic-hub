/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const { Route } = require('serverful')

const Database = require('../../database')

class GetButtons extends Route {
  constructor () {
    super('GET', '/buttons', 'Buttons', 'Returns all buttons')
  }

  handler (request, h) {
    return Database.buttons.findAll()
  }
}

module.exports = new GetButtons()
