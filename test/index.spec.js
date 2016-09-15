/* eslint max-nested-callbacks: ["error", 8] */
/* eslint-env mocha */
'use strict'

const expect = require('chai').expect
const crypto = require('libp2p-crypto')
const mh = require('multihashes')

const PeerId = require('../src')

const testId = require('./fixtures/sample-id')
const testIdHex = testId.id
const testIdBytes = mh.fromHexString(testId.id)
const testIdB58String = mh.toB58String(testIdBytes)

const goId = require('./fixtures/go-private-key')

describe('PeerId', () => {
  it('create an id without \'new\'', () => {
    expect(PeerId).to.throw(Error)
  })

  it('create a new id', (done) => {
    PeerId.create((err, id) => {
      expect(err).to.not.exist
      expect(id.toB58String().length).to.equal(46)
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

  it('Recreate from a Public Key', () => {
    const id = PeerId.createFromPubKey(testId.pubKey)
    expect(testIdB58String).to.equal(id.toB58String())
  })

  it('Recreate from a Private Key', () => {
    const id = PeerId.createFromPrivKey(testId.privKey)
    expect(testIdB58String).to.equal(id.toB58String())

    const encoded = new Buffer(testId.privKey, 'base64')
    const id2 = PeerId.createFromPrivKey(encoded)
    expect(testIdB58String).to.equal(id2.toB58String())
  })

  it('Compare generated ID with one created from PubKey', (done) => {
    PeerId.create((err, id1) => {
      expect(err).to.not.exist

      const id2 = PeerId.createFromPubKey(id1.marshalPubKey())
      expect(id1.id).to.be.eql(id2.id)
      done()
    })
  })

  it('Non-default # of bits', (done) => {
    PeerId.create({ bits: 512 }, (err, shortId) => {
      expect(err).to.not.exist
      PeerId.create({ bits: 1024 }, (err, longId) => {
        expect(err).to.not.exist
        expect(shortId.privKey.bytes.length).is.below(longId.privKey.bytes.length)
        done()
      })
    })
  })

  it('Pretty printing', () => {
    const id = PeerId.createFromPrivKey(testId.privKey)
    const out = id.toPrint()

    expect(out.id).to.equal(testIdB58String)
    expect(out.privKey).to.equal(testId.privKey)
    expect(out.pubKey).to.equal(testId.pubKey)
  })

  it('toBytes', () => {
    const id = PeerId.createFromHexString(testIdHex)
    expect(id.toBytes().toString('hex')).to.equal(testIdBytes.toString('hex'))
  })

  describe('toJSON', () => {
    it('full node', (done) => {
      PeerId.create({bits: 512}, (err, id) => {
        expect(err).to.not.exist

        const other = PeerId.createFromJSON(id.toJSON())

        expect(
          id.toB58String()
        ).to.equal(
          other.toB58String()
        )
        expect(
          id.privKey.bytes
        ).to.deep.equal(
          other.privKey.bytes
        )
        expect(
          id.pubKey.bytes
        ).to.deep.equal(
          other.pubKey.bytes
        )
        done()
      })
    })

    it('only id', (done) => {
      crypto.generateKeyPair('RSA', 512, (err, key) => {
        expect(err).to.not.exist
        const id = PeerId.createFromBytes(key.public.hash())
        expect(id.privKey).to.not.exist
        expect(id.pubKey).to.not.exist

        const other = PeerId.createFromJSON(id.toJSON())
        expect(
          id.toB58String()
        ).to.equal(
          other.toB58String()
        )
        done()
      })
    })

    it('go interop', () => {
      const id = PeerId.createFromJSON(goId)
      expect(
        mh.toB58String(id.privKey.public.hash())
      ).to.be.eql(
        goId.id
      )
    })
  })

  describe('throws on inconsistent data', () => {
    let k1, k2, k3
    before((done) => {
      crypto.generateKeyPair('RSA', 512, (err, _k1) => {
        if (err) return done(err)
        k1 = _k1
        crypto.generateKeyPair('RSA', 512, (err, _k2) => {
          if (err) return done(err)
          k2 = _k2
          crypto.generateKeyPair('RSA', 512, (err, _k3) => {
            if (err) return done(err)
            k3 = _k3
            done()
          })
        })
      })
    })

    it('missmatch id - private key', () => {
      expect(
        () => new PeerId(k1.public.hash(), k2)
      ).to.throw(
        /inconsistent arguments/
      )
    })

    it('missmatch id - public key', () => {
      expect(
        () => new PeerId(k1.public.hash(), null, k2.public)
      ).to.throw(
        /inconsistent arguments/
      )
    })

    it('missmatch private - public key', () => {
      expect(
        () => new PeerId(k1.public.hash(), k1, k2.public)
      ).to.throw(
        /inconsistent arguments/
      )
    })

    it('missmatch id - private - public key', () => {
      expect(
        () => new PeerId(k1.public.hash(), k1, k3.public)
      ).to.throw(
        /inconsistent arguments/
      )
    })

    it('invalid id', () => {
      expect(
        () => new PeerId(k1.public.hash().toString())
      ).to.throw(
        /invalid id/
      )
    })
  })
})
