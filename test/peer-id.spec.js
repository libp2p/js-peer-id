/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const chai = require('chai')
const dirtyChai = require('dirty-chai')
chai.use(dirtyChai)
const expect = chai.expect
const crypto = require('libp2p-crypto')
const mh = require('multihashes')
const parallel = require('async/parallel')

const PeerId = require('../src')

const testId = require('./fixtures/sample-id')
const testIdHex = testId.id
const testIdBytes = mh.fromHexString(testId.id)
const testIdB58String = mh.toB58String(testIdBytes)

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

  it('create a new id', (done) => {
    PeerId.create(testOpts, (err, id) => {
      expect(err).to.not.exist()
      expect(id.toB58String().length).to.equal(46)
      done()
    })
  })

  it('isPeerId', (done) => {
    PeerId.create(testOpts, (err, id) => {
      expect(err).to.not.exist()
      expect(PeerId.isPeerId(id)).to.equal(true)
      expect(PeerId.isPeerId('aaa')).to.equal(false)
      expect(PeerId.isPeerId(Buffer.from('batatas'))).to.equal(false)
      done()
    })
  })

  it('throws on changing the id', function (done) {
    this.timeout(10000)
    PeerId.create(testOpts, (err, id) => {
      expect(err).to.not.exist()
      expect(id.toB58String().length).to.equal(46)
      expect(() => {
        id.id = Buffer.from('hello')
      }).to.throw(/immutable/)
      done()
    })
  })

  it('recreate an Id from Hex string', () => {
    const id = PeerId.createFromHexString(testIdHex)
    expect(testIdBytes).to.deep.equal(id.id)
  })

  it('Recreate an Id from a Buffer', () => {
    const id = PeerId.createFromBytes(testIdBytes)
    expect(testId.id).to.equal(id.toHexString())
  })

  it('Recreate a B58 String', () => {
    const id = PeerId.createFromB58String(testIdB58String)
    expect(testIdB58String).to.equal(id.toB58String())
  })

  it('Recreate from a Public Key', (done) => {
    PeerId.createFromPubKey(testId.pubKey, (err, id) => {
      expect(err).to.not.exist()
      expect(testIdB58String).to.equal(id.toB58String())
      done()
    })
  })

  it('Recreate from a Private Key', (done) => {
    PeerId.createFromPrivKey(testId.privKey, (err, id) => {
      expect(err).to.not.exist()
      expect(testIdB58String).to.equal(id.toB58String())

      const encoded = Buffer.from(testId.privKey, 'base64')
      PeerId.createFromPrivKey(encoded, (err, id2) => {
        expect(err).to.not.exist()
        expect(testIdB58String).to.equal(id2.toB58String())
        expect(id.marshalPubKey()).to.deep.equal(id2.marshalPubKey())
        done()
      })
    })
  })

  it('Compare generated ID with one created from PubKey', (done) => {
    PeerId.create(testOpts, (err, id1) => {
      expect(err).to.not.exist()

      PeerId.createFromPubKey(id1.marshalPubKey(), (err, id2) => {
        expect(err).to.not.exist()
        expect(id1.id).to.be.eql(id2.id)
        done()
      })
    })
  })

  it('Works with default options', function (done) {
    this.timeout(10000)
    PeerId.create((err, id) => {
      expect(err).to.not.exist()
      expect(id.toB58String().length).to.equal(46)
      done()
    })
  })

  it('Non-default # of bits', function (done) {
    this.timeout(1000 * 60)
    PeerId.create(testOpts, (err, shortId) => {
      expect(err).to.not.exist()
      PeerId.create({ bits: 1024 }, (err, longId) => {
        expect(err).to.not.exist()
        expect(shortId.privKey.bytes.length).is.below(longId.privKey.bytes.length)
        done()
      })
    })
  })

  it('Pretty printing', (done) => {
    PeerId.create(testOpts, (err, id1) => {
      expect(err).to.not.exist()
      PeerId.createFromPrivKey(id1.toPrint().privKey, (err, id2) => {
        expect(err).to.not.exist()
        expect(id1.toPrint()).to.be.eql(id2.toPrint())
        done()
      })
    })
  })

  it('toBytes', () => {
    const id = PeerId.createFromHexString(testIdHex)
    expect(id.toBytes().toString('hex')).to.equal(testIdBytes.toString('hex'))
  })

  it('isEqual', (done) => {
    parallel([
      (cb) => PeerId.create(testOpts, cb),
      (cb) => PeerId.create(testOpts, cb)
    ], (err, ids) => {
      expect(err).to.not.exist()
      expect(ids[0].isEqual(ids[0])).to.equal(true)
      expect(ids[0].isEqual(ids[1])).to.equal(false)
      expect(ids[0].isEqual(ids[0].id)).to.equal(true)
      expect(ids[0].isEqual(ids[1].id)).to.equal(false)
      done()
    })
  })

  describe('fromJSON', () => {
    it('full node', (done) => {
      PeerId.create(testOpts, (err, id) => {
        expect(err).to.not.exist()

        PeerId.createFromJSON(id.toJSON(), (err, other) => {
          expect(err).to.not.exist()
          expect(id.toB58String()).to.equal(other.toB58String())
          expect(id.privKey.bytes).to.eql(other.privKey.bytes)
          expect(id.pubKey.bytes).to.eql(other.pubKey.bytes)
          done()
        })
      })
    })

    it('only id', (done) => {
      crypto.keys.generateKeyPair('RSA', 1024, (err, key) => {
        expect(err).to.not.exist()
        key.public.hash((err, digest) => {
          expect(err).to.not.exist()

          const id = PeerId.createFromBytes(digest)
          expect(id.privKey).to.not.exist()
          expect(id.pubKey).to.not.exist()

          PeerId.createFromJSON(id.toJSON(), (err, other) => {
            expect(err).to.not.exist()
            expect(id.toB58String()).to.equal(other.toB58String())
            done()
          })
        })
      })
    })

    it('go interop', (done) => {
      PeerId.createFromJSON(goId, (err, id) => {
        expect(err).to.not.exist()
        id.privKey.public.hash((err, digest) => {
          expect(err).to.not.exist()
          expect(mh.toB58String(digest)).to.eql(goId.id)
          done()
        })
      })
    })
  })

  it('set privKey (valid)', (done) => {
    PeerId.create(testOpts, (err, peerId) => {
      expect(err).to.not.exist()
      peerId.privKey = peerId._privKey
      peerId.isValid(done)
    })
  })

  it('set pubKey (valid)', (done) => {
    PeerId.create(testOpts, (err, peerId) => {
      expect(err).to.not.exist()
      peerId.pubKey = peerId._pubKey
      peerId.isValid(done)
    })
  })

  it('set privKey (invalid)', (done) => {
    PeerId.create(testOpts, (err, peerId) => {
      expect(err).to.not.exist()
      peerId.privKey = Buffer.from('bufff')
      peerId.isValid((err) => {
        expect(err).to.exist()
        done()
      })
    })
  })

  it('set pubKey (invalid)', (done) => {
    PeerId.create(testOpts, (err, peerId) => {
      expect(err).to.not.exist()
      peerId.pubKey = Buffer.from('buffff')
      peerId.isValid((err) => {
        expect(err).to.exist()
        done()
      })
    })
  })

  describe('throws on inconsistent data', () => {
    let k1
    let k2
    let k3

    before((done) => {
      parallel([
        (cb) => crypto.keys.generateKeyPair('RSA', 512, cb),
        (cb) => crypto.keys.generateKeyPair('RSA', 512, cb),
        (cb) => crypto.keys.generateKeyPair('RSA', 512, cb)
      ], (err, keys) => {
        expect(err).to.not.exist()

        k1 = keys[0]
        k2 = keys[1]
        k3 = keys[2]
        done()
      })
    })

    it('missmatch private - public key', (done) => {
      k1.public.hash((err, digest) => {
        expect(err).to.not.exist()
        expect(() => new PeerId(digest, k1, k2.public))
          .to.throw(/inconsistent arguments/)
        done()
      })
    })

    it('missmatch id - private - public key', (done) => {
      k1.public.hash((err, digest) => {
        expect(err).to.not.exist()
        expect(() => new PeerId(digest, k1, k3.public))
          .to.throw(/inconsistent arguments/)
        done()
      })
    })

    it('invalid id', () => {
      expect(() => new PeerId('hello world')).to.throw(/invalid id/)
    })
  })
})
