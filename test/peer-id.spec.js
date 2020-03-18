/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const { Buffer } = require('buffer')
const chai = require('chai')
const dirtyChai = require('dirty-chai')
chai.use(dirtyChai)
const expect = chai.expect
const crypto = require('libp2p-crypto')
const mh = require('multihashes')
const CID = require('cids')

const PeerId = require('../src')

const util = require('util')

const testId = require('./fixtures/sample-id')
const testIdHex = testId.id
const testIdBytes = mh.fromHexString(testId.id)
const testIdB58String = mh.toB58String(testIdBytes)
const testIdCID = new CID(1, 'libp2p-key', testIdBytes)
const testIdCIDString = testIdCID.toBaseEncodedString('base32')

const goId = require('./fixtures/go-private-key')

// Test options for making PeerId.create faster
// INSECURE, only use when testing
const testOpts = {
  bits: 512
}

describe('PeerId', () => {
  it('create an id without \'new\'', () => {
    expect(PeerId).to.throw(Error)
  })

  it('create a new id', async () => {
    const id = await PeerId.create(testOpts)
    expect(id.toB58String().length).to.equal(46)
  })

  it('can be created for a Secp256k1 key', async () => {
    const id = await PeerId.create({ keyType: 'secp256k1', bits: 256 })
    const expB58 = mh.toB58String(mh.encode(id.pubKey.bytes, 'identity'))
    expect(id.toB58String()).to.equal(expB58)
  })

  it('can get the public key from a Secp256k1 key', async () => {
    const original = await PeerId.create({ keyType: 'secp256k1', bits: 256 })
    const newId = PeerId.createFromB58String(original.toB58String())
    expect(original.pubKey.bytes).to.eql(newId.pubKey.bytes)
  })

  it('isPeerId', async () => {
    const id = await PeerId.create(testOpts)
    expect(PeerId.isPeerId(id)).to.equal(true)
    expect(PeerId.isPeerId('aaa')).to.equal(false)
    expect(PeerId.isPeerId(Buffer.from('batatas'))).to.equal(false)
  })

  it('throws on changing the id', async () => {
    const id = await PeerId.create(testOpts)
    expect(id.toB58String().length).to.equal(46)
    expect(() => {
      id.id = Buffer.from('hello')
    }).to.throw(/immutable/)
  })

  it('recreate from Hex string', () => {
    const id = PeerId.createFromHexString(testIdHex)
    expect(testIdBytes).to.deep.equal(id.toBytes())
  })

  it('recreate from a Buffer', () => {
    const id = PeerId.createFromBytes(testIdBytes)
    expect(testId.id).to.equal(id.toHexString())
    expect(testIdBytes).to.deep.equal(id.toBytes())
  })

  it('recreate from a B58 String', () => {
    const id = PeerId.createFromB58String(testIdB58String)
    expect(testIdB58String).to.equal(id.toB58String())
    expect(testIdBytes).to.deep.equal(id.toBytes())
  })

  it('recreate from CID object', () => {
    const id = PeerId.createFromCID(testIdCID)
    expect(testIdCIDString).to.equal(id.toString())
    expect(testIdBytes).to.deep.equal(id.toBytes())
  })

  it('recreate from Base58 String (CIDv0))', () => {
    const id = PeerId.createFromCID(testIdB58String)
    expect(testIdCIDString).to.equal(id.toString())
    expect(testIdBytes).to.deep.equal(id.toBytes())
  })

  it('recreate from CIDv1 Base32 (libp2p-key multicodec)', () => {
    const cid = new CID(1, 'libp2p-key', testIdBytes)
    const cidString = cid.toBaseEncodedString('base32')
    const id = PeerId.createFromCID(cidString)
    expect(cidString).to.equal(id.toString())
    expect(testIdBytes).to.deep.equal(id.toBytes())
  })

  it('recreate from CIDv1 Base32 (dag-pb multicodec)', () => {
    const cid = new CID(1, 'dag-pb', testIdBytes)
    const cidString = cid.toBaseEncodedString('base32')
    const id = PeerId.createFromCID(cidString)
    // toString should return CID with multicodec set to libp2p-key
    expect(new CID(id.toString()).codec).to.equal('libp2p-key')
    expect(testIdBytes).to.deep.equal(id.toBytes())
  })

  it('recreate from CID Buffer', () => {
    const id = PeerId.createFromCID(testIdCID.buffer)
    expect(testIdCIDString).to.equal(id.toString())
    expect(testIdBytes).to.deep.equal(id.toBytes())
  })

  it('throws on invalid CID multicodec', () => {
    // only libp2p and dag-pb are supported
    const invalidCID = new CID(1, 'raw', testIdBytes).toBaseEncodedString('base32')
    expect(() => {
      PeerId.createFromCID(invalidCID)
    }).to.throw(/Supplied PeerID CID has invalid multicodec: raw/)
  })

  it('throws on invalid CID value', () => {
    // using function code that does not represent valid hash function
    // https://github.com/multiformats/js-multihash/blob/b85999d5768bf06f1b0f16b926ef2cb6d9c14265/src/constants.js#L345
    const invalidCID = 'QmaozNR7DZHQK1ZcU9p7QdrshMvXqWK6gpu5rmrkPdT3L'
    expect(() => {
      PeerId.createFromCID(invalidCID)
    }).to.throw(/multihash unknown function code: 0x50/)
  })

  it('throws on invalid CID object', () => {
    const invalidCID = {}
    expect(() => {
      PeerId.createFromCID(invalidCID)
    }).to.throw(/Invalid version, must be a number equal to 1 or 0/)
  })

  it('throws on invalid CID object', () => {
    const invalidCID = {}
    expect(() => {
      PeerId.createFromCID(invalidCID)
    }).to.throw(/Invalid version, must be a number equal to 1 or 0/)
  })

  it('recreate from a Public Key', async () => {
    const id = await PeerId.createFromPubKey(testId.pubKey)
    expect(testIdB58String).to.equal(id.toB58String())
    expect(testIdBytes).to.deep.equal(id.toBytes())
  })

  it('recreate from a Private Key', async () => {
    const id = await PeerId.createFromPrivKey(testId.privKey)
    expect(testIdB58String).to.equal(id.toB58String())
    const encoded = Buffer.from(testId.privKey, 'base64')
    const id2 = await PeerId.createFromPrivKey(encoded)
    expect(testIdB58String).to.equal(id2.toB58String())
    expect(id.marshalPubKey()).to.deep.equal(id2.marshalPubKey())
  })

  it('recreate from Protobuf', async () => {
    const id = await PeerId.createFromProtobuf(testId.marshaled)
    expect(testIdB58String).to.equal(id.toB58String())
    const encoded = Buffer.from(testId.privKey, 'base64')
    const id2 = await PeerId.createFromPrivKey(encoded)
    expect(testIdB58String).to.equal(id2.toB58String())
    expect(id.marshalPubKey()).to.deep.equal(id2.marshalPubKey())
    expect(id.marshal().toString('hex')).to.deep.equal(testId.marshaled)
  })

  it('can be created from a Secp256k1 public key', async () => {
    const privKey = await crypto.keys.generateKeyPair('secp256k1', 256)
    const id = await PeerId.createFromPubKey(privKey.public.bytes)
    const expB58 = mh.toB58String(mh.encode(id.pubKey.bytes, 'identity'))
    expect(id.toB58String()).to.equal(expB58)
  })

  it('can be created from a Secp256k1 private key', async () => {
    const privKey = await crypto.keys.generateKeyPair('secp256k1', 256)
    const id = await PeerId.createFromPrivKey(privKey.bytes)
    const expB58 = mh.toB58String(mh.encode(id.pubKey.bytes, 'identity'))
    expect(id.toB58String()).to.equal(expB58)
  })

  it('Compare generated ID with one created from PubKey', async () => {
    const id1 = await PeerId.create(testOpts)
    const id2 = await PeerId.createFromPubKey(id1.marshalPubKey())
    expect(id1.id).to.be.eql(id2.id)
  })

  it('Works with default options', async function () {
    this.timeout(10000)
    const id = await PeerId.create()
    expect(id.toB58String().length).to.equal(46)
  })

  it('Non-default # of bits', async function () {
    this.timeout(1000 * 60)
    const shortId = await PeerId.create(testOpts)
    const longId = await PeerId.create({ bits: 1024 })
    expect(shortId.privKey.bytes.length).is.below(longId.privKey.bytes.length)
  })

  it('Pretty printing', async () => {
    const id1 = await PeerId.create(testOpts)
    const id2 = await PeerId.createFromPrivKey((id1.toJSON()).privKey)
    expect(id1.toPrint()).to.be.eql(id2.toPrint())
    expect(id1.toPrint()).to.equal('<peer.ID ' + id1.toB58String().substr(2, 6) + '>')
  })

  it('toBytes', () => {
    const id = PeerId.createFromHexString(testIdHex)
    expect(id.toBytes().toString('hex')).to.equal(testIdBytes.toString('hex'))
  })

  it('isEqual', async () => {
    const ids = await Promise.all([
      PeerId.create(testOpts),
      PeerId.create(testOpts)
    ])

    expect(ids[0].isEqual(ids[0])).to.equal(true)
    expect(ids[0].isEqual(ids[1])).to.equal(false)
    expect(ids[0].isEqual(ids[0].id)).to.equal(true)
    expect(ids[0].isEqual(ids[1].id)).to.equal(false)
  })

  it('equals', async () => {
    const ids = await Promise.all([
      PeerId.create(testOpts),
      PeerId.create(testOpts)
    ])

    expect(ids[0].equals(ids[0])).to.equal(true)
    expect(ids[0].equals(ids[1])).to.equal(false)
    expect(ids[0].equals(ids[0].id)).to.equal(true)
    expect(ids[0].equals(ids[1].id)).to.equal(false)
  })

  describe('fromJSON', () => {
    it('full node', async () => {
      const id = await PeerId.create(testOpts)
      const other = await PeerId.createFromJSON(id.toJSON())
      expect(id.toB58String()).to.equal(other.toB58String())
      expect(id.privKey.bytes).to.eql(other.privKey.bytes)
      expect(id.pubKey.bytes).to.eql(other.pubKey.bytes)
    })

    it('only id', async () => {
      const key = await crypto.keys.generateKeyPair('RSA', 1024)
      const digest = await key.public.hash()
      const id = PeerId.createFromBytes(digest)
      expect(id.privKey).to.not.exist()
      expect(id.pubKey).to.not.exist()
      const other = await PeerId.createFromJSON(id.toJSON())
      expect(id.toB58String()).to.equal(other.toB58String())
    })

    it('go interop', async () => {
      const id = await PeerId.createFromJSON(goId)
      const digest = await id.privKey.public.hash()
      expect(mh.toB58String(digest)).to.eql(goId.id)
    })
  })

  it('set privKey (valid)', async () => {
    const peerId = await PeerId.create(testOpts)
    // @ts-ignore
    peerId.privKey = peerId._privKey
    expect(peerId.isValid()).to.equal(true)
  })

  it('set pubKey (valid)', async () => {
    const peerId = await PeerId.create(testOpts)
    // @ts-ignore
    peerId.pubKey = peerId._pubKey
    expect(peerId.isValid()).to.equal(true)
  })

  it('set privKey (invalid)', async () => {
    const peerId = await PeerId.create(testOpts)
    // @ts-ignore
    peerId.privKey = Buffer.from('bufff')
    expect(peerId.isValid()).to.equal(false)
  })

  it('set pubKey (invalid)', async () => {
    const peerId = await PeerId.create(testOpts)
    // @ts-ignore
    peerId.pubKey = Buffer.from('bufff')
    expect(peerId.isValid()).to.equal(false)
  })

  describe('returns error via cb instead of crashing', () => {
    const garbage = [
      Buffer.from('00010203040506070809', 'hex'),
      {}, null, false, undefined, true, 1, 0,
      Buffer.from(''), 'aGVsbG93b3JsZA==', 'helloworld', ''
    ]

    const fncs = ['createFromPubKey', 'createFromPrivKey', 'createFromJSON', 'createFromProtobuf']

    for (const gb of garbage) {
      for (const fn of fncs) {
        it(`${fn} (${util.inspect(gb)})`, async () => {
          try {
            await PeerId[fn](gb)
          } catch (err) {
            expect(err).to.exist()
          }
        })
      }
    }
  })

  describe('throws on inconsistent data', () => {
    let k1
    let k2
    let k3

    before(async () => {
      const keys = await Promise.all([
        crypto.keys.generateKeyPair('RSA', 512),
        crypto.keys.generateKeyPair('RSA', 512),
        crypto.keys.generateKeyPair('RSA', 512)
      ])

      k1 = keys[0]
      k2 = keys[1]
      k3 = keys[2]
    })

    it('missmatch private - public key', async () => {
      const digest = await k1.public.hash()
      expect(() => {
        new PeerId(digest, k1, k2.public) // eslint-disable-line no-new
      }).to.throw(/inconsistent arguments/)
    })

    it('missmatch id - private - public key', async () => {
      const digest = await k1.public.hash()
      expect(() => {
        new PeerId(digest, k1, k3.public) // eslint-disable-line no-new
      }).to.throw(/inconsistent arguments/)
    })

    it('invalid id', () => {
      expect(() => new PeerId('hello world')).to.throw(/invalid id/)
    })
  })
})
