ipfs-peer-id Node.js implementation
===================================

![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)

> IPFS Peer Id implementation in Node.js

# Description

A IPFS Peer Id is based on a sha256 has of the peer public key, using [multihash](https://github.com/jbenet/multihash)

# Usage

### Installing

```
$ npm install ipfs-peer-id
```

### Creating a new Id

```
var PeerId = require('ipfs-peer')

// Create a new Id
var id = new Id.create()

// Recreate an Id from Hex string
var id = new Id.createFromHexString(str)

// Recreate an Id from a Buffer
var id = new Id.createFromBytes(buf)

// Recreate an B58 String
var id = new Id.createFromB58String(str)

// Recreate from a Public Key
var id = new Id.createFromPubKey(pubKey)

// Recreate from a Private Key
var id = new Id.createFromPrivKey(privKey)
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
