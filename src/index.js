'use strict'

const { CID } = require('multiformats/cid')
const b32 = require('multiformats/bases/base32')
const b36 = require('multiformats/bases/base36')
const b58 = require('multiformats/bases/base58')
const b64 = require('multiformats/bases/base64')
const { base58btc } = require('multiformats/bases/base58')
const { base32 } = require('multiformats/bases/base32')
const { base16 } = require('multiformats/bases/base16')
const Digest = require('multiformats/hashes/digest')
const cryptoKeys = require('libp2p-crypto/src/keys')
const { PeerIdProto } = require('./proto')
const { equals: uint8ArrayEquals } = require('uint8arrays/equals')
const { fromString: uint8ArrayFromString } = require('uint8arrays/from-string')
const { toString: uint8ArrayToString } = require('uint8arrays/to-string')
const { identity } = require('multiformats/hashes/identity')

const bases = {
  ...b32,
  ...b36,
  ...b58,
  ...b64
}
const baseDecoder = Object.keys(bases).reduce(
  (acc, curr) => acc.or(bases[curr]),
  base32.decoder
)

// these values are from https://github.com/multiformats/multicodec/blob/master/table.csv
const DAG_PB_CODE = 0x70
const LIBP2P_KEY_CODE = 0x72

const symbol = Symbol.for('@libp2p/peer-id')

/**
 * @typedef {import('libp2p-crypto').PrivateKey} PrivateKey
 * @typedef {import('libp2p-crypto').PublicKey} PublicKey
 * @typedef {import('libp2p-crypto').KeyType} KeyType
 * @typedef {import('cids').CIDVersion} CIDVersion
 */

/**
 * PeerId JSON format.
 *
 * @typedef {Object} PeerIdJSON
 * @property {string} id - String representation of PeerId.
 * @property {string} [pubKey] - Public key.
 * @property {string} [privKey] - Private key.
 */

/**
 * Options for PeerId creation.
 *
 * @typedef {Object} CreateOptions
 * @property {number} [bits] - The number of bits to use.
 * @property {KeyType} [keyType] - The type of key to use.
 */

class PeerId {
  /**
   * Create PeerId object
   *
   * @class
   *
   * @param {Uint8Array} id
   * @param {PrivateKey} [privKey]
   * @param {PublicKey} [pubKey]
   */
  constructor (id, privKey, pubKey) {
    if (!(id instanceof Uint8Array)) {
      throw new Error('invalid id provided')
    }

    if (privKey && pubKey && !uint8ArrayEquals(privKey.public.bytes, pubKey.bytes)) {
      throw new Error('inconsistent arguments')
    }

    // Define symbol
    Object.defineProperty(this, symbol, { value: true })

    this._id = id
    this._idB58String = base58btc.encode(this.id).substring(1)
    this._privKey = privKey
    this._pubKey = pubKey
  }

  /**
   * @type {Uint8Array}
   */
  get id () {
    return this._id
  }

  // @ts-ignore
  set id (val) {
    throw new Error('Id is immutable')
  }

  /**
   * @type {PrivateKey | undefined}
   */
  get privKey () {
    return this._privKey
  }

  set privKey (privKey) {
    this._privKey = privKey
  }

  /**
   * @type {PublicKey | undefined}
   */
  get pubKey () {
    if (this._pubKey) {
      return this._pubKey
    }

    if (this._privKey) {
      return this._privKey.public
    }

    try {
      const decoded = Digest.decode(this.id)

      if (decoded.code === identity.code) {
        this._pubKey = cryptoKeys.unmarshalPublicKey(decoded.digest)
      }
    } catch (_) {
      // Ignore, there is no valid public key
    }

    return this._pubKey
  }

  set pubKey (pubKey) {
    this._pubKey = pubKey
  }

  /**
   * Return the protobuf version of the public key, matching go ipfs formatting
   *
   * @returns {Uint8Array | undefined}
   */
  marshalPubKey () {
    if (this.pubKey) {
      return cryptoKeys.marshalPublicKey(this.pubKey)
    }
  }

  /**
   * Return the protobuf version of the private key, matching go ipfs formatting
   *
   * @returns {Uint8Array | undefined}
   */
  marshalPrivKey () {
    if (this.privKey) {
      return cryptoKeys.marshalPrivateKey(this.privKey)
    }
  }

  /**
   * Return the protobuf version of the peer-id
   *
   * @param {boolean} [excludePriv] - Whether to exclude the private key information from the output.
   * @returns {Uint8Array}
   */
  marshal (excludePriv) {
    return PeerIdProto.encode({
      id: this.toBytes(),
      pubKey: this.marshalPubKey(),
      privKey: excludePriv ? null : this.marshalPrivKey()
    }).finish()
  }

  /**
   * String representation
   *
   * @returns {string}
   */
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

  /**
   * The jsonified version of the key, matching the formatting of go-ipfs for its config file
   *
   * @returns {PeerIdJSON}
   */
  toJSON () {
    const privKey = this.marshalPrivKey()
    const pubKey = this.marshalPubKey()

    return {
      id: this.toB58String(),
      privKey: privKey && toB64Opt(privKey),
      pubKey: pubKey && toB64Opt(pubKey)
    }
  }

  /**
   * Encode to hex.
   *
   * @returns {string}
   */
  toHexString () {
    return base16.encode(this.id).substring(1)
  }

  /**
   * Return raw id bytes
   *
   * @returns {Uint8Array}
   */
  toBytes () {
    return this.id
  }

  /**
   * Encode to base58 string.
   *
   * @returns {string}
   */
  toB58String () {
    return this._idB58String
  }

  /**
   * Self-describing String representation
   * in default format from RFC 0001: https://github.com/libp2p/specs/pull/209
   *
   * @returns {string}
   */
  toString () {
    // We will create the property right here
    // @ts-ignore
    if (!this._idCIDString) {
      const cid = CID.createV1(LIBP2P_KEY_CODE, Digest.decode(this.id))

      Object.defineProperty(this, '_idCIDString', {
        value: cid.toString(),
        enumerable: false
      })
    }

    // This property is just created
    // @ts-ignore
    return this._idCIDString
  }

  /**
   * Checks the equality of `this` peer against a given PeerId.
   *
   * @param {Uint8Array|PeerId} id
   * @returns {boolean}
   */
  equals (id) {
    if (id instanceof Uint8Array) {
      return uint8ArrayEquals(this.id, id)
    } else if (id.id) {
      return uint8ArrayEquals(this.id, id.id)
    } else {
      throw new Error('not valid Id')
    }
  }

  /**
   * Checks the equality of `this` peer against a given PeerId.
   *
   * @deprecated Use `.equals`
   * @param {Uint8Array|PeerId} id
   * @returns {boolean}
   */
  isEqual (id) {
    return this.equals(id)
  }

  /**
   * Check if this PeerId instance is valid (privKey -> pubKey -> Id)
   *
   * @returns {boolean}
   */
  isValid () {
    // TODO: needs better checking
    return Boolean(this.privKey &&
      this.privKey.public &&
      this.privKey.public.bytes &&
      this.pubKey &&
      this.pubKey.bytes instanceof Uint8Array &&
        uint8ArrayEquals(this.privKey.public.bytes, this.pubKey.bytes))
  }

  /**
   * Check if the PeerId has an inline public key.
   *
   * @returns {boolean}
   */
  hasInlinePublicKey () {
    try {
      const decoded = Digest.decode(this.id)

      if (decoded.code === identity.code) {
        return true
      }
    } catch (_) {
      // Ignore, there is no valid public key
    }

    return false
  }

  /**
   * Create a new PeerId.
   *
   * @param {CreateOptions} [opts] - Options
   * @returns {Promise<PeerId>}
   */
  static async create ({ bits = 2048, keyType = 'RSA' } = {}) {
    const key = await cryptoKeys.generateKeyPair(keyType, bits)
    return computePeerId(key.public, key)
  }

  /**
   * Create PeerId from raw bytes.
   *
   * @param {Uint8Array} buf - The raw bytes.
   * @returns {PeerId}
   */
  static createFromBytes (buf) {
    return new PeerId(buf)
  }

  /**
   * Create PeerId from base58-encoded string.
   *
   * @param {string} str - The base58-encoded string.
   * @returns {PeerId}
   */
  static createFromB58String (str) {
    return PeerId.createFromCID(str) // B58String is CIDv0
  }

  /**
   * Create PeerId from hex string.
   *
   * @param {string} str - The hex string.
   * @returns {PeerId}
   */
  static createFromHexString (str) {
    return new PeerId(base16.decode('f' + str))
  }

  /**
   * Create PeerId from CID.
   *
   * @param {CID | CIDVersion | Uint8Array | string} cid - The CID.
   * @returns {PeerId}
   */
  static createFromCID (cid) {
    cid = CID.asCID(cid)

    if (!cid || !validMulticodec(cid)) {
      throw new Error('Supplied PeerID CID is invalid')
    }

    return new PeerId(cid.multihash.bytes)
  }

  /**
   * Create PeerId from public key.
   *
   * @param {Uint8Array | string} key - Public key, as Uint8Array or base64-encoded string.
   * @returns {Promise<PeerId>}
   */
  static async createFromPubKey (key) {
    let buf = key

    if (typeof buf === 'string') {
      buf = uint8ArrayFromString(String(key), 'base64pad')
    }

    if (!(buf instanceof Uint8Array)) {
      throw new Error('Supplied key is neither a base64 string nor a Uint8Array')
    }

    const pubKey = await cryptoKeys.unmarshalPublicKey(buf)
    return computePeerId(pubKey)
  }

  /**
   * Create PeerId from private key.
   *
   * @param {Uint8Array | string} key - Private key, as Uint8Array or base64-encoded string.
   * @returns {Promise<PeerId>}
   */
  static async createFromPrivKey (key) {
    if (typeof key === 'string') {
      key = uint8ArrayFromString(key, 'base64pad')
    }

    if (!(key instanceof Uint8Array)) {
      throw new Error('Supplied key is neither a base64 string nor a Uint8Array')
    }

    const privKey = await cryptoKeys.unmarshalPrivateKey(key)
    return computePeerId(privKey.public, privKey)
  }

  /**
   * Create PeerId from PeerId JSON formatted object.
   *
   * @param {PeerIdJSON} obj
   * @returns {Promise<PeerId>}
   */
  static async createFromJSON (obj) {
    const id = base58btc.decode('z' + obj.id)
    const rawPrivKey = obj.privKey && uint8ArrayFromString(obj.privKey, 'base64pad')
    const rawPubKey = obj.pubKey && uint8ArrayFromString(obj.pubKey, 'base64pad')
    const pub = rawPubKey && await cryptoKeys.unmarshalPublicKey(rawPubKey)

    if (!rawPrivKey) {
      return new PeerId(id, undefined, pub)
    }

    const privKey = await cryptoKeys.unmarshalPrivateKey(rawPrivKey)
    const privDigest = await computeDigest(privKey.public)

    let pubDigest

    if (pub) {
      pubDigest = await computeDigest(pub)
    }

    if (pub && !uint8ArrayEquals(privDigest, pubDigest)) {
      throw new Error('Public and private key do not match')
    }

    if (id && !uint8ArrayEquals(privDigest, id)) {
      throw new Error('Id and private key do not match')
    }

    return new PeerId(id, privKey, pub)
  }

  /**
   * Create PeerId from Protobuf bytes.
   *
   * @param {Uint8Array | string} buf - Protobuf bytes, as Uint8Array or hex-encoded string.
   * @returns {Promise<PeerId>}
   */
  static async createFromProtobuf (buf) {
    if (typeof buf === 'string') {
      buf = uint8ArrayFromString(buf, 'base16')
    }
  
    let { id, privKey, pubKey } = PeerIdProto.decode(buf)
  
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
        if (!uint8ArrayEquals(privDigest, pubDigest)) {
          throw new Error('Public and private key do not match')
        }
      }
      return new PeerId(privDigest, privKey, privKey.public)
    }
  
    // TODO: val id and pubDigest
  
    if (pubKey) {
      return new PeerId(pubDigest, undefined, pubKey)
    }
  
    if (id) {
      return new PeerId(id)
    }
  
    throw new Error('Protobuf did not contain any usable key material')
  }

  /**
   * Parse PeerId object
   * 
   * @param {String} str 
   * @returns 
   */
  static parse(str) {
    if (str.charAt(0) === '1' || str.charAt(0) === 'Q') {
      // identity hash ed25519 key or sha2-256 hash of rsa public key
      // base58btc encoded either way
      str = `z${str}`
    }
  
    return PeerId.createFromBytes(baseDecoder.decode(str))
  }

  /**
   * Checks if a value is an instance of PeerId.
   *
   * @param {any} peerId - The value to check.
   * @returns {boolean}
   */
  static isPeerId (peerId) {
    return peerId instanceof PeerId || Boolean(peerId && peerId[symbol])
  }
}

/**
 * Compute digest.
 *
 * @param {PublicKey} pubKey
 * @returns {Promise<Uint8Array>}
 */
const computeDigest = async (pubKey) => {
  if (pubKey.bytes.length <= 42) {
    return Digest.create(identity.code, pubKey.bytes).bytes
  } else {
    return pubKey.hash()
  }
}

/**
 * Compute PeerId.
 *
 * @param {PublicKey} pubKey
 * @param {PrivateKey} [privKey]
 * @returns {Promise<PeerId>}
 */
const computePeerId = async (pubKey, privKey) => {
  const digest = await computeDigest(pubKey)
  return new PeerId(digest, privKey, pubKey)
}

/**
 * Create PeerId from CID.
 *
 * @param {CID | {codec: string}} cid - The CID.
 * @returns {boolean}
 */
const validMulticodec = (cid) => {
  // supported: 'libp2p-key' (CIDv1) and 'dag-pb' (CIDv0 converted to CIDv1)
  return cid.code === LIBP2P_KEY_CODE || cid.code === DAG_PB_CODE
}

/**
 * @param {Uint8Array} val
 * @returns {string}
 */
const toB64Opt = (val) => {
  return uint8ArrayToString(val, 'base64pad')
}
