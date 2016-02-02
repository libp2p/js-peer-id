/*
 * Id is an object representation of a peer Id. a peer Id is a multihash
 */

var fs = require('fs')
var multihashing = require('multihashing')
var base58 = require('bs58')
var forge = require('node-forge')
var protobuf = require('protocol-buffers')

//protobuf read from file
var messages = protobuf(fs.readFileSync(__dirname+'/crypto.proto'))

exports = module.exports = Id

exports.Buffer = Buffer

function Id (id, privKey, pubKey) {
  var self = this

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

//unwrap the private key protobuf stream 
function unmarshal (key) {
  var dpb = messages.PrivateKey.decode(key)
  return dpb
}

//create a public key protobuf to be base64 string stored in config
function marshal (data, type) {
  if(type == 'Public'){
    var epb = messages.PublicKey.encode({
      Type: 0,
      Data: data
    })
  }

  if(type == 'Private'){
    var epb = messages.PrivateKey.encode({
      Type: 0,
      Data: data
    })
  }

  return epb
}

// generation
exports.create = function () {
  //generate keys
  var pair = forge.rsa.generateKeyPair({bits:2048, e: 0x10001})

  //Create Public Key
  //return the RSA public key to asn1 object and DER encode
  var asnPub = forge.pki.publicKeyToAsn1(pair.publicKey)

  //create der buffer of public key asn.1 object
  var derPub = forge.asn1.toDer(asnPub)

  //create forge buffer of der public key buffer
  var fDerBuf = forge.util.createBuffer(derPub.data, 'binary')

  //convert forge buffer to node buffer public key
  var nDerBuf = new Buffer(fDerBuf.getBytes(), 'binary')

  //protobuf the new DER bytes to the PublicKey Data: field
  var marPubKey = marshal(nDerBuf, 'Public')

  //encode the protobuf public key to base64 string
  var pubKeyb64 = marPubKey.toString('base64')


  //create Private Key
  //return the RSA private key to asn1 object and DER encode
  var asnPriv = forge.pki.privateKeyToAsn1(pair.privateKey)

  //create der buffer of private key asn.1 object
  var derPriv = forge.asn1.toDer(asnPriv)

  //create forge buffer of der private key buffer
  var fDerBufPriv = forge.util.createBuffer(derPriv.data, 'binary')

  //convert forge buffer to node buffer private key
  var nDerBufPriv = new Buffer(fDerBufPriv.getBytes(), 'binary')

  //protobuf the new DER bytes to the PrivateKey Data: field
  var marPrivKey = marshal(nDerBufPriv, 'Private')

  //encode the protobuf private key to base64 string
  var privKeyb64 = marPrivKey.toString('base64')

  var mhId = multihashing(marPubKey, 'sha2-256')

  return new Id(mhId, privKeyb64, pubKeyb64)
}

exports.createFromHexString = function (str) {
  return new Id(new Buffer(str), 'hex')
}

exports.createFromBytes = function (buf) {
  return new Id(buf)
}

exports.createFromB58String = function (str) {
  return new Id(new Buffer(base58.decode(str)))
}

exports.createFromPubKey = function (pubKey) {
  var buf = new Buffer(pubKey, 'base64')
  var mhId = multihashing(pubKey, 'sha2-256')
  return new Id(mhId, null, pubKey)
}

exports.createFromPrivKey = function (privKey) {
  //create a buffer from the base64 encoded string
  var buf = new Buffer(privKey, 'base64')

  //get the private key data from the protobuf
  var mpk = unmarshal(buf)

  //create a forge buffer
  var fbuf = forge.util.createBuffer(mpk.Data.toString('binary'))

  //create an asn1 object from the private key bytes saved in the protobuf Data: field
  var asnPriv = forge.asn1.fromDer(fbuf)

  //get the RSA privatekey data from the asn1 object
  var privateKey = forge.pki.privateKeyFromAsn1(asnPriv)

  //set the RSA public key to the modulus and exponent of the private key
  var publicKey = forge.pki.rsa.setPublicKey(privateKey.n, privateKey.e)

  //return the RSA public to asn1 object and DER encode
  var asnPub = forge.pki.publicKeyToAsn1(publicKey)

  //create der buffer of public key asn.1 object
  var derPub = forge.asn1.toDer(asnPub)

  //create forge buffer of der buffer
  var fDerBuf = forge.util.createBuffer(derPub.data, 'binary')

  //convert forge buffer to node buffer
  var nDerBuf = new Buffer(fDerBuf.getBytes(), 'binary')

  //protobuf the new DER bytes to the PublicKey Data: field
  var marPubKey = marshal(nDerBuf, 'Public')

  //encode the protobuf public key to base64 string
  var pubKeyb64 = marPubKey.toString('base64')

  var mhId = multihashing(marPubKey, 'sha2-256')

  return new Id(mhId, privKey, pubKeyb64)
}
