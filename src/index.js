/*
 * Id is an object representation of a peer Id. a peer Id is a multihash
 */

'use strict'

const mh = require('multihashes')
const crypto = require('libp2p-crypto')
const assert = require('assert')

class PeerId {
  constructor (id, privKey, pubKey) {
    if (Buffer.isBuffer(id)) {
      this.id = id
    } else {
      throw new Error('invalid id provided')
    }

    if (pubKey) {
      assert(this.id.equals(pubKey.hash()), 'inconsistent arguments')
    }

    if (privKey) {
      assert(this.id.equals(privKey.public.hash()), 'inconsistent arguments')
    }

    if (privKey && pubKey) {
      assert(privKey.public.bytes.equals(pubKey.bytes), 'inconsistent arguments')
    }

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

  marshalPubKey () {
    if (this.pubKey) {
      return crypto.marshalPublicKey(this.pubKey)
    }
  }

  marshalPrivKey () {
    if (this.privKey) {
      return crypto.marshalPrivateKey(this.privKey)
    }
  }

  // pretty print
  toPrint () {
    return {
      id: mh.toB58String(this.id),
      privKey: toHexOpt(this.marshalPrivKey()),
      pubKey: toHexOpt(this.marshalPubKey())
    }
  }

  toJSON () {
    return {
      id: mh.toHexString(this.id),
      privKey: toHexOpt(this.marshalPrivKey()),
      pubKey: toHexOpt(this.marshalPubKey())
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
    priv = crypto.unmarshalPrivateKey(new Buffer(obj.privKey, 'hex'))
  }

  if (obj.pubKey) {
    pub = crypto.unmarshalPublicKey(new Buffer(obj.pubKey, 'hex'))
  }

  return new PeerId(mh.fromHexString(obj.id), priv, pub)
}

function toHexOpt (val) {
  if (val) {
    return val.toString('hex')
  }
}
