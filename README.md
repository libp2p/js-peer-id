# peer-id

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![Build Status](https://travis-ci.org/diasdavid/js-peer-id.svg?style=flat-square)](https://travis-ci.org/diasdavid/js-peer-id)
[![Coverage Status](https://coveralls.io/repos/github/diasdavid/js-peer-id/badge.svg?branch=master)](https://coveralls.io/github/diasdavid/js-peer-id?branch=master)
[![Dependency Status](https://david-dm.org/diasdavid/js-peer-id.svg?style=flat-square)](https://david-dm.org/diasdavid/js-peer-id)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)

> [IPFS](https://github.com/ipfs/ipfs) Peer ID implementation in JavaScript.

# Description

Generate, import, and export PeerIDs, for use with [IPFS](https://github.com/ipfs/ipfs).

*A Peer ID is the SHA-256 [multihash](https://github.com/jbenet/multihash) of a
public key.*

*The public key is a base64 encoded string of a protobuf containing an RSA DER
buffer. This uses a node buffer to pass the base64 encoded public key protobuf
to the multihash for ID generation.*

# Example

```js
var PeerId = require('peer-id')
var bs58 = require('bs58')

var id = PeerId.create({ bits: 32 })

console.log('id        ', id.toB58String())
console.log('priv key  ', bs58.encode(id.privKey.bytes))
console.log('pub key   ', bs58.encode(id.pubKey.bytes))
```

```
id         QmeeLFb92nkZJGj3gXLqXrEMzCMYs6uBgQLVNbrcXEvYXk
priv key   6ibrcPAbevzvPpkq6EA6XmLyuhmUrJrEvUfgQDtEiSEPzGnGU8Ejwf6b11DVm6opnFGo
pub key    2BeBZVKJ9RQs4i4LbGv4ReEeuBA5dck2Gje3wt67e44XuyyPq5jE
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
<script src="https://npmcdn.com/peer-id/dist/index.min.js"></script>
<!-- OR -->
<script src="https://npmcdn.com/peer-id/dist/index.js"></script>
```

# API

```js
const PeerId = require('peer-id')
```

## Create

### `new PeerId(id[, privKey, pubKey])`

- `id: Buffer` - The multihash of the publick key as `Buffer`
- `privKey: RsaPrivateKey` - The private key
- `pubKey: RsaPublicKey` - The public key

The key format is detailed in [libp2p-crypto](https://github.com/ipfs/js-libp2p-crypto).

### `create([opts])`

Generates a new Peer ID, complete with public/private keypair.

- `opts: Object`: Default: `{bits: 2048}`

## Import

### `createFromHexString(str)`

Creates a Peer ID from hex string representing the key's multihash.

### `createFromBytes(buf)`

Creates a Peer ID from a buffer representing the key's multihash.

### `createFromB58String(str)`
Creates a Peer ID from a Base58 string representing the key's multihash.

### `createFromPubKey(pubKey)`

Creates a Peer ID from a buffer containing a public key.

### `createFromPrivKey(privKey)`

Creates a Peer ID from a buffer containing a private key.

### `createFromJSON(obj)`

- `obj.id: String` - The multihash encoded in `base58`
- `obj.pubKey: String` - The public key in protobuf format, encoded in 'base64'
- `obj.privKey: String` - The private key in protobuf format, encoded in 'base 64'


## Export

### `toHexString()`

Returns the Peer ID's `id` as a hex string.

```
1220d6243998f2fc56343ad7ed0342ab7886a4eb18d736f1b67d44b37fcc81e0f39f
```

### `toBytes()`

Returns the Peer ID's `id` as a buffer.

```
<Buffer 12 20 d6 24 39 98 f2 fc 56 34 3a d7 ed 03 42 ab 78 86 a4 eb 18 d7 36 f1 b6 7d 44 b3 7f cc 81 e0 f3 9f>
```

### `toB58String()`

Returns the Peer ID's `id` as a base58 string.

```
QmckZzdVd72h9QUFuJJpQqhsZqGLwjhh81qSvZ9BhB2FQi
```

### `toJSON()`

Returns an `obj` of the form

- `obj.id: String` - The multihash encoded in `base58`
- `obj.pubKey: String` - The public key in protobuf format, encoded in 'base64'
- `obj.privKey: String` - The private key in protobuf format, encoded in 'base 64'


### `toPrint()`

Alias for `.toJSON()`.


# License

MIT
