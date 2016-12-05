'use strict'

const mh = require('multihashes')
const crypto = require('libp2p-crypto')
const assert = require('assert')
const waterfall = require('async/waterfall')

/**
 * @name PeerIdJson
 * @type {Object}
 * @typedef {Object} PeerIdJson
 * @param {string} id - `Base58` encoded peer id
 * @param {string=} privKey - The RSA private key in protobuf format, encoded in `base64`.
 * @param {string=} pubKey - The RSA public key in protobuf format, encoded in `base64`.
 */

/**
 * A Peer ID is the SHA-256
 * [multihash](https://github.com/multiformats/multihash) of a
 * public key.
 * @class PeerId
 * @see [libp2p-crypto](htttps://github.com/libp2p/js-libp2p-crypto)
 */
class PeerId {
  /**
   * @param {Buffer} id
   * @param {RSAPrivateKey=} privKey
   * @param {RSAPublickKey=} pubKey
   */
  constructor (id, privKey, pubKey) {
    assert(Buffer.isBuffer(id), 'invalid id provided')

    if (privKey && pubKey) {
      assert(privKey.public.bytes.equals(pubKey.bytes), 'inconsistent arguments')
    }

    /**
     * @type {Buffer}
     */
    this.id = id
    this._privKey = privKey
    this._pubKey = pubKey
  }

  /**
   * The private key of this id, if it exists.
   *
   * @type {RSAPrivateKey|undefined}
   */
  get privKey () {
    return this._privKey
  }

  /**
   * The public key of this id, if it exists.
   *
   * @type {(RSAPublicKey|undefined)}
   */
  get pubKey () {
    if (this._pubKey) {
      return this._pubKey
    }

    if (this.privKey) {
      return this.privKey.public
    }
  }

  /** Create the protobuf version of the public key,
   *  matching go-ipfs formatting.
   *
   * @returns {Buffer} - The marshalled public key
   */
  marshalPubKey () {
    if (this.pubKey) {
      return crypto.marshalPublicKey(this.pubKey)
    }
  }

  /** Create the protobuf version of the private key,
   *  matching go-ipfs formatting.
   *
   * @returns {Buffer}
   */
  marshalPrivKey () {
    if (this.privKey) {
      return crypto.marshalPrivateKey(this.privKey)
    }
  }

  /**
   * Alias for `toJSON`.
   *
   * @returns {PeerIdJson}
   */
  toPrint () {
    return this.toJSON()
  }

  /**
   * Return the jsonified version of the key, matching the formatting
   * of go-ipfs for its config file.
   *
   * @returns {PeerIdJson}
   */
  toJSON () {
    return {
      id: mh.toB58String(this.id),
      privKey: toB64Opt(this.marshalPrivKey()),
      pubKey: toB64Opt(this.marshalPubKey())
    }
  }

  /**
   * Returns the Peer ID's `id` as a hex string.
   *
   * @returns {String}
   */
  toHexString () {
    return mh.toHexString(this.id)
  }

  /**
   * Returns the Peer ID's `id` as a buffer.
   *
   * @returns {Buffer}
   */
  toBytes () {
    return this.id
  }

  /**
   * Returns the Peer ID's `id` as a base58 string.
   *
   * @returns {String}
   */
  toB58String () {
    return mh.toB58String(this.id)
  }

  /**
   * Create a new `PeerId` by generating a new public/private keypair.
   *
   * @param {Object=} opts - Configuration object.
   * @param {number} [opts.bits=2048] - How many bits to use for the RSA key generation.
   * @param {function(Error, PeerId)} callback - Node.js style callback.
   * @returns {undefined}
   *
   * @example
   * const PeerId = require('peer-id')
   *
   * PeerId.create((err, id) => {
   *   if (err) {
   *     throw err
   *   }
   *   console.log('id', JSON.stringify(id))
   * })
   *
   */
  static create (opts, callback) {
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

  /**
   * Creates a Peer ID from hex string representing the key's multihash.
   *
   * @param {string} str - Hex encoded id
   * @returns {PeerId}
   */
  static createFromHexString (str) {
    return new PeerId(mh.fromHexString(str))
  }

  /**
   * Creates a Peer ID from a buffer representing the key's multihash.
   *
   * @param {Buffer} buf
   * @returns {PeerId}
   */
  static createFromBytes (buf) {
    return new PeerId(buf)
  }

  /**
   * Creates a Peer ID from a `base58` string representing the
   * key's multihash.
   *
   * @param {string} str - `base58` encoded id
   * @returns {PeerId}
   */
  static createFromB58String (str) {
    return new PeerId(mh.fromB58String(str))
  }

  /**
   * Creates a Peer ID from a buffer containing a public key.
   *
   * @param {string|Buffer} key
   * @param {function(Error, PeerId)} callback
   * @returns {undefined}
   */
  static createFromPubKey (key, callback) {
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

  /**
   * Creates a Peer ID from a buffer containing a private key.
   *
   * @param {string|Buffer} key - The private key, if passed as
   *   string `base64` encoding is assumed.
   * @param {function(Error, PeerId)} callback
   * @returns {undefined}
   */
  static createFromPrivKey (key, callback) {
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

  /**
   * Import a `PeerId` from a serialized JSON object.
   *
   * @param {PeerIdJson} obj
   * @param {function(Error, PeerId)} callback
   * @returns {undefined}
   */
  static createFromJSON (obj, callback) {
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
}

/**
 * Convert a given `Buffer` to a `base64` encoded string.
 * If no `val` is given it just returns `undefined`.
 *
 * @private
 * @param {Buffer=} val
 * @returns {string|undefined}
 */
function toB64Opt (val) {
  if (val) {
    return val.toString('base64')
  }
}

exports = module.exports = PeerId
