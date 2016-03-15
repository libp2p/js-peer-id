/*
 * Id is an object representation of a peer Id. a peer Id is a multihash
 */

const fs = require('fs')
const multihashing = require('multihashing')
const base58 = require('bs58')
const forge = require('node-forge')
const protobuf = require('protocol-buffers')
const path = require('path')

const isNode = !global.window

// protobuf read from file
const messages = isNode ? protobuf(fs.readFileSync(path.resolve(__dirname, 'pb/crypto.proto'))) : protobuf(require('buffer!./pb/crypto.proto'))

exports = module.exports = Id

exports.Buffer = Buffer

function Id (id, privKey, pubKey) {
  const self = this

  if (!(self instanceof Id)) {
    throw new Error('Id must be called with new')
  }

  self.privKey = privKey
  self.pubKey = pubKey
  self.id = id // multihash - sha256 - buffer

  // pretty print
  self.toPrint = function () {
    return {
      id: self.toB58String(),
      privKey: privKey.toString('hex'),
      pubKey: pubKey.toString('hex')
    }
  }

  // encode/decode functions
  self.toHexString = function () {
    return self.id.toString('hex')
  }

  self.toBytes = function () {
    return self.id
  }

  self.toB58String = function () {
    return base58.encode(self.id)
  }
}

// unwrap the private key protobuf
function unmarshal (key) {
  return messages.PrivateKey.decode(key)
}

// create a public key protobuf to be base64 string stored in config
function marshal (data, type) {
  var epb
  if (type === 'Public') {
    epb = messages.PublicKey.encode({
      Type: 0,
      Data: data
    })
  }

  if (type === 'Private') {
    epb = messages.PrivateKey.encode({
      Type: 0,
      Data: data
    })
  }

  return epb
}

// this returns a base64 encoded protobuf of the public key
function formatKey (key, type) {
  // create der buffer of public key asn.1 object
  const der = forge.asn1.toDer(key)

  // create forge buffer of der public key buffer
  const fDerBuf = forge.util.createBuffer(der.data, 'binary')

  // convert forge buffer to node buffer public key
  const nDerBuf = new Buffer(fDerBuf.getBytes(), 'binary')

  // protobuf the new DER bytes to the PublicKey Data: field
  const marshalKey = marshal(nDerBuf, type)

  // encode the protobuf public key to base64 string
  const b64 = marshalKey.toString('base64')
  return b64
}

// generation
exports.create = function (opts) {
  opts = opts || {}
  opts.bits = opts.bits || 2048

  // generate keys
  const pair = forge.rsa.generateKeyPair({
    bits: opts.bits,
    e: 0x10001
  })

  // return the RSA public/private key to asn1 object
  const asnPub = forge.pki.publicKeyToAsn1(pair.publicKey)
  const asnPriv = forge.pki.privateKeyToAsn1(pair.privateKey)

  // format the keys to protobuf base64 encoded string
  const protoPublic64 = formatKey(asnPub, 'Public')
  const protoPrivate64 = formatKey(asnPriv, 'Private')

  // store the keys as a buffer
  const bufProtoPub64 = new Buffer(protoPublic64, 'base64')
  const bufProtoPriv64 = new Buffer(protoPrivate64, 'base64')

  const mhId = multihashing(new Buffer(protoPublic64, 'base64'), 'sha2-256')

  return new Id(mhId, bufProtoPriv64, bufProtoPub64)
}

exports.createFromHexString = function (str) {
  return new Id(new Buffer(str, 'hex'))
}

exports.createFromBytes = function (buf) {
  return new Id(buf)
}

exports.createFromB58String = function (str) {
  return new Id(new Buffer(base58.decode(str)))
}

// Public Key input will be a buffer
exports.createFromPubKey = function (pubKey) {
  const buf = new Buffer(pubKey, 'base64')
  const mhId = multihashing(buf, 'sha2-256')
  return new Id(mhId, null, pubKey)
}

// Private key input will be a string
exports.createFromPrivKey = function (privKey) {
  // create a buffer from the base64 encoded string
  const buf = new Buffer(privKey, 'base64')

  // get the private key data from the protobuf
  const mpk = unmarshal(buf)

  // create a forge buffer
  const fbuf = forge.util.createBuffer(mpk.Data.toString('binary'))

  // create an asn1 object from the private key bytes saved in the protobuf Data: field
  const asnPriv = forge.asn1.fromDer(fbuf)

  // get the RSA privatekey data from the asn1 object
  const privateKey = forge.pki.privateKeyFromAsn1(asnPriv)

  // set the RSA public key to the modulus and exponent of the private key
  const publicKey = forge.pki.rsa.setPublicKey(privateKey.n, privateKey.e)

  // return the RSA public key to asn1 object
  const asnPub = forge.pki.publicKeyToAsn1(publicKey)

  // format the public key
  const protoPublic64 = formatKey(asnPub, 'Public')

  // buffer the public key for consistency before storing
  const bufProtoPub64 = new Buffer(protoPublic64, 'base64')
  const mhId = multihashing(new Buffer(protoPublic64, 'base64'), 'sha2-256')
  return new Id(mhId, privKey, bufProtoPub64)
}
