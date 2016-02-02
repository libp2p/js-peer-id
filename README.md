peer-id JavaScript implementation
==============================

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io) [[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs) ![Build Status](https://travis-ci.org/diasdavid/js-peer-id.svg?style=flat-square)](https://travis-ci.org/diasdavid/js-peer-id) ![](https://img.shields.io/badge/coverage-%3F-yellow.svg?style=flat-square) [![Dependency Status](https://david-dm.org/diasdavid/js-peer-id.svg?style=flat-square)](https://david-dm.org/diasdavid/js-peer-id) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
> IPFS Peer Id implementation in JavaScript

# Description

A IPFS Peer Id is based on a sha256 hash of the peer public key, using [multihash](https://github.com/jbenet/multihash)

The public key is currently a base64 encoded string of a protobuf of an RSA DER buffer. This uses a node buffer to pass the base64 encoded public key protobuf to the multihash for ID generation. 


# Usage

### In Node.js through npm

```bash
$ npm install --save peer-id
```

```javascript
var PeerId = require('peer-id')
```

### In the Browser through browserify

Same as in Node.js, you just have to [browserify](https://github.com/substack/node-browserify) the code before serving it. See the browserify repo for how to do that.

### In the Browser through `<script>` tag

Make the [peer-id.min.js](/dist/peer-id.min.js) available through your server and load it using a normal `<script>` tag, this will export the `peerId` constructor on the `window` object, such that:

```JavaScript
var PeerId = window.PeerId
```

#### Gotchas

You will need to use Node.js `Buffer` API compatible, if you are running inside the browser, you can access it by `PeerId.Buffer` or you can install Feross's [Buffer](https://github.com/feross/buffer).

### Creating a new Id

```
var PeerId = require('ipfs-peer')

// Create a new Id
var id = PeerId.create()

// Recreate an Id from Hex string
var id = PeerId.createFromHexString(str)

// Recreate an Id from a Buffer
var id = PeerId.createFromBytes(buf)

// Recreate an B58 String
var id = PeerId.createFromB58String(str)

// Recreate from a Public Key
var id = PeerId.createFromPubKey(pubKey)

// Recreate from a Private Key
var id = PeerId.createFromPrivKey(privKey)
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
