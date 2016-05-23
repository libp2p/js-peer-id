#!/usr/local/bin/node

'use strict'

const PeerId = require('./index.js')

console.log(JSON.stringify(PeerId.create().toJSON(), null, '  '))
