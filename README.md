peer-id JavaScript implementation
=================================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Build Status](https://travis-ci.org/diasdavid/js-peer-id.svg?style=flat-square)](https://travis-ci.org/diasdavid/js-peer-id)
![](https://img.shields.io/badge/coverage-100%25-brightgreen.svg?style=flat-square)
[![Dependency Status](https://david-dm.org/diasdavid/js-peer-id.svg?style=flat-square)](https://david-dm.org/diasdavid/js-peer-id)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
> IPFS Peer Id implementation in JavaScript

# Description

An IPFS Peer Id is based on a sha256 hash of the peer public key, using [multihash](https://github.com/jbenet/multihash)

The public key is a base64 encoded string of a protobuf containing an RSA DER buffer. This uses a node buffer to pass the base64 encoded public key protobuf to the multihash for ID generation.

# Installation

## npm

```sh
> npm i peer-id
```

## Use in Node.js

```JavaScript
var PeerId = require('peer-id')
```

## Use in a browser with browserify, webpack or any other bundler

The code published to npm that gets loaded on require is in fact a ES5 transpiled version with the right shims added. This means that you can require it and use with your favourite bundler without having to adjust asset management process.

```JavaScript
var PeerId = require('peer-id')
```

## Use in a browser Using a script tag

Loading this module through a script tag will make the `PeerId` obj available in the global namespace.

```html
<script src="https://npmcdn.com/peer-id/dist/index.min.js"></script>
<!-- OR -->
<script src="https://npmcdn.com/peer-id/dist/index.js"></script>
```

# Usage

### Creating a new Id

```
const PeerId = require('ipfs-peer')

// Create a new Id
const id = PeerId.create()

// Recreate an Id from Hex string
const id = PeerId.createFromHexString(str)

// Recreate an Id from a Buffer
const id = PeerId.createFromBytes(buf)

// Recreate an B58 String
const id = PeerId.createFromB58String(str)

// Recreate from a Public Key
const id = PeerId.createFromPubKey(pubKey)

// Recreate from a Private Key
const id = PeerId.createFromPrivKey(privKey)
```

### Exporting an Id

```
// Print friendly format
id.toPrint() // returns an object with id, privKey and pubKey in hex format

// Export to an hex string
id.toHexString()

// Export to Buffer
id.toBytes() (same as id.id)

// Export to a B58 string
id.toB58String()
```

### Id format

```
id.pubKey   // Buffer containing the Public Key
id.privKey  // Buffer containing the Private Key
id.id       // Buffer containing the multihash
```
