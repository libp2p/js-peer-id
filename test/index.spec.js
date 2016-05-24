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

  it('create a new id', () => {
    const id = PeerId.create()
    expect(id.toB58String().length).to.equal(46)
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

    const id2 = PeerId.createFromPrivKey(new Buffer(testId.privKey, 'base64'))
    expect(testIdB58String).to.equal(id2.toB58String())
  })

  it('Compare generated ID with one created from PubKey', () => {
    const id1 = PeerId.create()
    const id2 = PeerId.createFromPubKey(id1.marshalPubKey())
    expect(id1.id).to.be.eql(id2.id)
  })

  it('Non-default # of bits', () => {
    const shortId = PeerId.create({ bits: 128 })
    const longId = PeerId.create({ bits: 256 })
    expect(shortId.privKey.bytes.length).is.below(longId.privKey.bytes.length)
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
    it('full node', () => {
      const id = PeerId.create({bits: 64})
      expect(
        id.toB58String()
      ).to.equal(
        PeerId.createFromJSON(id.toJSON()).toB58String()
      )
      expect(
        id.privKey.bytes
      ).to.deep.equal(
        PeerId.createFromJSON(id.toJSON()).privKey.bytes
      )
      expect(
        id.pubKey.bytes
      ).to.deep.equal(
        PeerId.createFromJSON(id.toJSON()).pubKey.bytes
      )
    })

    it('only id', () => {
      const key = crypto.generateKeyPair('RSA', 64)
      const id = PeerId.createFromBytes(key.public.hash())
      expect(
        id.toB58String()
      ).to.equal(
        PeerId.createFromJSON(id.toJSON()).toB58String()
      )

      expect(id.privKey).to.not.exist
      expect(id.pubKey).to.not.exist
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
    const k1 = crypto.generateKeyPair('RSA', 64)
    const k2 = crypto.generateKeyPair('RSA', 64)
    const k3 = crypto.generateKeyPair('RSA', 64)

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
