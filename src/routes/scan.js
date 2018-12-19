/*
 * Copyright (c) 2018, Hugo Freire <hugo@exec.sh>.
 *
 * This source code is licensed under the license found in the
 * LICENSE.md file in the root directory of this source tree.
 */

const { Route } = require('serverful')

const FlicWrapper = require('../flic-wrapper')

class Scan extends Route {
  constructor () {
    super('GET', '/scan', 'Scan', 'Return the result of a flic scan')
  }

  handler (request, h) {
    return FlicWrapper.scan()
  }
}

module.exports = new Scan()
