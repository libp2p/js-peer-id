# peer-id

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Build Status](https://travis-ci.org/libp2p/js-peer-id.svg?style=flat-square)](https://travis-ci.org/libp2p/js-peer-id)
[![Coverage Status](https://coveralls.io/repos/github/libp2p/js-peer-id/badge.svg?branch=master)](https://coveralls.io/github/libp2p/js-peer-id?branch=master)
[![Dependency Status](https://david-dm.org/libp2p/js-peer-id.svg?style=flat-square)](https://david-dm.org/libp2p/js-peer-id)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
![](https://img.shields.io/badge/npm-%3E%3D3.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D4.0.0-orange.svg?style=flat-square)

[![Sauce Test Status](https://saucelabs.com/browser-matrix/ipfs-js-peer-id.svg)](https://saucelabs.com/u/ipfs-js-peer-id)

> [IPFS](https://github.com/ipfs/ipfs) Peer ID implementation in JavaScript.

- [Description](#description)
- [Example](#example)
- [Installation](#installation)
  - [npm](#npm)
- [Setup](#setup)
  - [Node.js](#nodejs)
  - [Browser: Browserify, Webpack, other bundlers](#browser-browserify-webpack-other-bundlers)
  - [Browser: `<script>` Tag](#browser-script-tag)
- [API](#api)
- [License](#license)

# Description

Generate, import, and export PeerIDs, for use with [IPFS](https://github.com/ipfs/ipfs).

*A Peer ID is the SHA-256 [multihash](https://github.com/multiformats/multihash) of a
public key.*

*The public key is a base64 encoded string of a protobuf containing an RSA DER
buffer. This uses a node buffer to pass the base64 encoded public key protobuf
to the multihash for ID generation.*

# Example

```js
var PeerId = require('peer-id')

PeerId.create({ bits: 1024 }, (err, id) => {
  console.log(JSON.stringify(id.toJSON(), null, 2)
})
```

```
{
  "id": "Qma9T5YraSnpRDZqRR4krcSJabThc8nwZuJV3LercPHufi",
  "privKey": "CAAS4AQwggJcAgEAAoGBAMBgbIqyOL26oV3nGPBYrdpbv..",
  "pubKey": "CAASogEwgZ8wDQYJKoZIhvcNAQEBBQADgY0AMIGJAoGBAMBgbIqyOL26oV3nGPBYrdpbvzCY..."
}
```

# Installation

## npm

```sh
> npm i peer-id
```

# Setup

## Node.js

```js
var PeerId = require('peer-id')
```

## Browser: Browserify, Webpack, other bundlers

The code published to npm that gets loaded on require is in fact a ES5
transpiled version with the right shims added. This means that you can require
it and use with your favourite bundler without having to adjust asset management
process.

```js
var PeerId = require('peer-id')
```

## Browser: `<script>` Tag

Loading this module through a script tag will make the `PeerId` obj available in
the global namespace.

```html
<script src="https://unpkg.com/peer-id/dist/index.min.js"></script>
<!-- OR -->
<script src="https://unpkg.com/peer-id/dist/index.js"></script>
```

# API

# License

MIT
