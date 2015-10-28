peer-id JavaScript implementation
==============================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [[![](https://img.shields.io/badge/freejs-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs) ![Build Status](https://travis-ci.org/diasdavid/js-peer-id.svg?style=flat-square)](https://travis-ci.org/diasdavid/js-peer-id) ![](https://img.shields.io/badge/coverage-%3F-yellow.svg?style=flat-square) [![Dependency Status](https://david-dm.org/diasdavid/js-peer-id.svg?style=flat-square)](https://david-dm.org/diasdavid/js-peer-id) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> IPFS Peer Id implementation in Node.js

# Description

A IPFS Peer Id is based on a sha256 has of the peer public key, using [multihash](https://github.com/jbenet/multihash)

# Usage

### Installing

```
$ npm install peer-id
```

### Creating a new Id

```
var PeerId = require('ipfs-peer')

// Create a new Id
var id = new PeerId.create()

// Recreate an Id from Hex string
var id = new PeerId.createFromHexString(str)

// Recreate an Id from a Buffer
var id = new PeerId.createFromBytes(buf)

// Recreate an B58 String
var id = new PeerId.createFromB58String(str)

// Recreate from a Public Key
var id = new PeerId.createFromPubKey(pubKey)

// Recreate from a Private Key
var id = new PeerId.createFromPrivKey(privKey)
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
