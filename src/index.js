/*
 * Id is an object representation of a peer Id. a peer Id is a multihash
 */

'use strict'

const mh = require('multihashes')
const crypto = require('libp2p-crypto')
const assert = require('assert')
const waterfall = require('async/waterfall')

class PeerId {
  constructor (id, privKey, pubKey) {
    assert(Buffer.isBuffer(id), 'invalid id provided')

    if (privKey && pubKey) {
      assert(privKey.public.bytes.equals(pubKey.bytes), 'inconsistent arguments')
    }

    this._id = id
    this._idB58String = mh.toB58String(this.id)
    this._privKey = privKey
    this._pubKey = pubKey
  }

  get id () {
    return this._id
  }

  set id (val) {
    throw new Error('Id is immutable')
  }

  get privKey () {
    return this._privKey
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
      id: this.toB58String(),
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
    return this._idB58String
  }
}

exports = module.exports = PeerId
exports.Buffer = Buffer

// generation
exports.create = function (opts, callback) {
  if (typeof opts === 'function') {
    callback = opts
    opts = {}
  }
  opts = opts || {}
  opts.bits = opts.bits || 2048

  waterfall([
    (cb) => crypto.generateKeyPair('RSA', opts.bits, cb),
    (privKey, cb) => privKey.public.hash((err, digest) => {
      cb(err, digest, privKey)
    })
  ], (err, digest, privKey) => {
    if (err) {
      return callback(err)
    }

    callback(null, new PeerId(digest, privKey))
  })
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
exports.createFromPubKey = function (key, callback) {
  let buf = key
  if (typeof buf === 'string') {
    buf = new Buffer(key, 'base64')
  }

  if (typeof callback !== 'function') {
    throw new Error('callback is required')
  }

  const pubKey = crypto.unmarshalPublicKey(buf)
  pubKey.hash((err, digest) => {
    if (err) {
      return callback(err)
    }

    callback(null, new PeerId(digest, null, pubKey))
  })
}

// Private key input will be a string
exports.createFromPrivKey = function (key, callback) {
  let buf = key
  if (typeof buf === 'string') {
    buf = new Buffer(key, 'base64')
  }

  if (typeof callback !== 'function') {
    throw new Error('callback is required')
  }

  waterfall([
    (cb) => crypto.unmarshalPrivateKey(buf, cb),
    (privKey, cb) => privKey.public.hash((err, digest) => {
      cb(err, digest, privKey)
    })
  ], (err, digest, privKey) => {
    if (err) {
      return callback(err)
    }

    callback(null, new PeerId(digest, privKey))
  })
}

exports.createFromJSON = function (obj, callback) {
  if (typeof callback !== 'function') {
    throw new Error('callback is required')
  }

  const id = mh.fromB58String(obj.id)
  const rawPrivKey = obj.privKey && new Buffer(obj.privKey, 'base64')
  const rawPubKey = obj.pubKey && new Buffer(obj.pubKey, 'base64')
  const pub = rawPubKey && crypto.unmarshalPublicKey(rawPubKey)

  if (rawPrivKey) {
    waterfall([
      (cb) => crypto.unmarshalPrivateKey(rawPrivKey, cb),
      (priv, cb) => priv.public.hash((err, digest) => {
        cb(err, digest, priv)
      }),
      (privDigest, priv, cb) => {
        if (pub) {
          pub.hash((err, pubDigest) => {
            cb(err, privDigest, priv, pubDigest)
          })
        } else {
          cb(null, privDigest, priv)
        }
      }
    ], (err, privDigest, priv, pubDigest) => {
      if (err) {
        return callback(err)
      }

      if (pub && !privDigest.equals(pubDigest)) {
        return callback(new Error('Public and private key do not match'))
      }

      if (id && !privDigest.equals(id)) {
        return callback(new Error('Id and private key do not match'))
      }

      callback(null, new PeerId(id, priv, pub))
    })
  } else {
    callback(null, new PeerId(id, null, pub))
  }
}

function toB64Opt (val) {
  if (val) {
    return val.toString('base64')
  }
}
