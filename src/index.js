/*
 * Id is an object representation of a peer Id. a peer Id is a multihash
 */

'use strict'

const mh = require('multihashes')
const crypto = require('libp2p-crypto')
const assert = require('assert')

class PeerId {
  constructor (id, privKey, pubKey) {
    assert(Buffer.isBuffer(id), 'invalid id provided')

    if (pubKey) {
      assert(id.equals(pubKey.hash()), 'inconsistent arguments')
    }

    if (privKey) {
      assert(id.equals(privKey.public.hash()), 'inconsistent arguments')
    }

    if (privKey && pubKey) {
      assert(privKey.public.bytes.equals(pubKey.bytes), 'inconsistent arguments')
    }

    this.id = id
    this.privKey = privKey
    this._pubKey = pubKey
  }

  get pubKey () {
    if (this._pubKey) {
      return this._pubKey
    }

    if (this.privKey) {
      return this.privKey.public
    }
  }

  // Return the protobuf version of the public key,
  // matching go ipfs formatting
  marshalPubKey () {
    if (this.pubKey) {
      return crypto.marshalPublicKey(this.pubKey)
    }
  }

  // Return the protobuf version of the private key,
  // matching go ipfs formatting
  marshalPrivKey () {
    if (this.privKey) {
      return crypto.marshalPrivateKey(this.privKey)
    }
  }

  // pretty print
  toPrint () {
    return this.toJSON()
  }

  // return the jsonified version of the key, matching the formatting
  // of go-ipfs for its config file
  toJSON () {
    return {
      id: mh.toB58String(this.id),
      privKey: toB64Opt(this.marshalPrivKey()),
      pubKey: toB64Opt(this.marshalPubKey())
    }
  }

  // encode/decode functions
  toHexString () {
    return mh.toHexString(this.id)
  }

  toBytes () {
    return this.id
  }

  toB58String () {
    return mh.toB58String(this.id)
  }
}

exports = module.exports = PeerId
exports.Buffer = Buffer

// generation
exports.create = function (opts) {
  opts = opts || {}
  opts.bits = opts.bits || 2048

  const privKey = crypto.generateKeyPair('RSA', opts.bits)

  return new PeerId(privKey.public.hash(), privKey)
}

exports.createFromHexString = function (str) {
  return new PeerId(mh.fromHexString(str))
}

exports.createFromBytes = function (buf) {
  return new PeerId(buf)
}

exports.createFromB58String = function (str) {
  return new PeerId(mh.fromB58String(str))
}

// Public Key input will be a buffer
exports.createFromPubKey = function (key) {
  let buf = key
  if (typeof buf === 'string') {
    buf = new Buffer(key, 'base64')
  }
  const pubKey = crypto.unmarshalPublicKey(buf)
  return new PeerId(pubKey.hash(), null, pubKey)
}

// Private key input will be a string
exports.createFromPrivKey = function (key) {
  let buf = key
  if (typeof buf === 'string') {
    buf = new Buffer(key, 'base64')
  }

  const privKey = crypto.unmarshalPrivateKey(buf)
  return new PeerId(privKey.public.hash(), privKey)
}

exports.createFromJSON = function (obj) {
  let priv
  let pub

  if (obj.privKey) {
    priv = crypto.unmarshalPrivateKey(new Buffer(obj.privKey, 'base64'))
  }

  if (obj.pubKey) {
    pub = crypto.unmarshalPublicKey(new Buffer(obj.pubKey, 'base64'))
  }

  return new PeerId(mh.fromB58String(obj.id), priv, pub)
}

function toB64Opt (val) {
  if (val) {
    return val.toString('base64')
  }
}
