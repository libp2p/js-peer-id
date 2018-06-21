/*
 * Id is an object representation of a peer Id. a peer Id is a multihash
 */

'use strict'

const mh = require('multihashes')
const cryptoKeys = require('libp2p-crypto/src/keys')
const assert = require('assert')
const withIs = require('class-is')
const {PeerIdProto} = require('./proto')

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

  set privKey (privKey) {
    this._privKey = privKey
  }

  get pubKey () {
    if (this._pubKey) {
      return this._pubKey
    }

    if (this._privKey) {
      return this._privKey.public
    }
  }

  set pubKey (pubKey) {
    this._pubKey = pubKey
  }

  // Return the protobuf version of the public key, matching go ipfs formatting
  marshalPubKey () {
    if (this.pubKey) {
      return cryptoKeys.marshalPublicKey(this.pubKey)
    }
  }

  // Return the protobuf version of the private key, matching go ipfs formatting
  marshalPrivKey () {
    if (this.privKey) {
      return cryptoKeys.marshalPrivateKey(this.privKey)
    }
  }

  // Return the protobuf version of the peer-id
  marshal (excludePriv) {
    return PeerIdProto.encode({
      id: this.toBytes(),
      pubKey: this.marshalPubKey(),
      privKey: excludePriv ? null : this.marshalPrivKey()
    })
  }

  toPrint () {
    let pid = this.toB58String()
    // All sha256 nodes start with Qm
    // We can skip the Qm to make the peer.ID more useful
    if (pid.startsWith('Qm')) {
      pid = pid.slice(2)
    }
    let maxRunes = 6
    if (pid.length < maxRunes) {
      maxRunes = pid.length
    }

    return '<peer.ID ' + pid.substr(0, maxRunes) + '>'
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

  isEqual (id) {
    if (Buffer.isBuffer(id)) {
      return this.id.equals(id)
    } else if (id.id) {
      return this.id.equals(id.id)
    } else {
      throw new Error('not valid Id')
    }
  }

  /*
   * Check if this PeerId instance is valid (privKey -> pubKey -> Id)
   */
  isValid () {
    // TODO: needs better checking
    return Boolean(this.privKey &&
      this.privKey.public &&
      this.privKey.public.bytes &&
      Buffer.isBuffer(this.pubKey.bytes) &&
      this.privKey.public.bytes.equals(this.pubKey.bytes))
  }
}

const PeerIdWithIs = withIs(PeerId, {
  className: 'PeerId',
  symbolName: '@libp2p/js-peer-id/PeerId'
})

exports = module.exports = PeerIdWithIs

const computeDigest = (pubKey) => {
  if (pubKey.bytes.length <= 42) {
    return mh.encode(pubKey.bytes, 'identity')
  } else {
    return pubKey.hash()
  }
}

const computePeerId = async (privKey, pubKey) => {
  const digest = await computeDigest(pubKey)
  return new PeerIdWithIs(digest, privKey, pubKey)
}

// generation
exports.create = async (opts) => {
  opts = opts || {}
  opts.bits = opts.bits || 2048
  opts.keyType = opts.keyType || 'RSA'

  const key = await cryptoKeys.generateKeyPair(opts.keyType, opts.bits)
  return computePeerId(key, key.public)
}

exports.createFromHexString = (str) => {
  return new PeerIdWithIs(mh.fromHexString(str))
}

exports.createFromBytes = (buf) => {
  return new PeerIdWithIs(buf)
}

exports.createFromB58String = (str) => {
  return new PeerIdWithIs(mh.fromB58String(str))
}

// Public Key input will be a buffer
exports.createFromPubKey = async (key) => {
  let buf = key

  if (typeof buf === 'string') {
    buf = Buffer.from(key, 'base64')
  }

  if (!Buffer.isBuffer(buf)) {
    throw new Error('Supplied key is neither a base64 string nor a buffer')
  }

  const pubKey = await cryptoKeys.unmarshalPublicKey(buf)
  return computePeerId(null, pubKey)
}

// Private key input will be a string
exports.createFromPrivKey = async (key) => {
  let buf = key

  if (typeof buf === 'string') {
    buf = Buffer.from(key, 'base64')
  }

  if (!Buffer.isBuffer(buf)) {
    throw new Error('Supplied key is neither a base64 string nor a buffer')
  }

  const privKey = await cryptoKeys.unmarshalPrivateKey(buf)
  return computePeerId(privKey, privKey.public)
}

exports.createFromJSON = async (obj) => {
  let id = mh.fromB58String(obj.id)
  let rawPrivKey = obj.privKey && Buffer.from(obj.privKey, 'base64')
  let rawPubKey = obj.pubKey && Buffer.from(obj.pubKey, 'base64')
  let pub = rawPubKey && await cryptoKeys.unmarshalPublicKey(rawPubKey)

  if (!rawPrivKey) {
    return new PeerIdWithIs(id, null, pub)
  }

  const privKey = await cryptoKeys.unmarshalPrivateKey(rawPrivKey)
  const privDigest = await computeDigest(privKey.public)

  let pubDigest

  if (pub) {
    pubDigest = await computeDigest(pub)
  }

  if (pub && !privDigest.equals(pubDigest)) {
    throw new Error('Public and private key do not match')
  }

  if (id && !privDigest.equals(id)) {
    throw new Error('Id and private key do not match')
  }

  return new PeerIdWithIs(id, privKey, pub)
}

exports.createFromProtobuf = async (buf) => {
  if (typeof buf === 'string') {
    buf = Buffer.from(buf, 'hex')
  }

  let {id, privKey, pubKey} = PeerIdProto.decode(buf)

  privKey = privKey ? await cryptoKeys.unmarshalPrivateKey(privKey) : false
  pubKey = pubKey ? await cryptoKeys.unmarshalPublicKey(pubKey) : false

  let pubDigest
  let privDigest

  if (privKey) {
    privDigest = await computeDigest(privKey.public)
  }

  if (pubKey) {
    pubDigest = await computeDigest(pubKey)
  }

  if (privKey) {
    if (pubKey) {
      if (!privDigest.equals(pubDigest)) {
        throw new Error('Public and private key do not match')
      }
    }
    return new PeerIdWithIs(privDigest, privKey, privKey.public)
  }

  // TODO: val id and pubDigest

  if (pubKey) {
    return new PeerIdWithIs(pubDigest, null, pubKey)
  }

  if (id) {
    return new PeerIdWithIs(id)
  }

  throw new Error('Protobuf did not contain any usable key material')
}

exports.isPeerId = (peerId) => {
  return Boolean(typeof peerId === 'object' &&
    peerId._id &&
    peerId._idB58String)
}

function toB64Opt (val) {
  if (val) {
    return val.toString('base64')
  }
}
