#!/usr/bin/env node

'use strict'

const PeerId = require('./index.js')

async function main () {
  const id = await PeerId.create()
  console.log(JSON.stringify(id.toJSON(), null, 2)) // eslint-disable-line no-console
}

main()
