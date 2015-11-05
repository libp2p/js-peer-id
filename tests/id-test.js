var test = require('tape')
var PeerId = require('../src')

var testId = {
  id: '1220151ab1658d8294ab34b71d5582cfe20d06414212f440a69366f1bc31deb5c72d',
  privKey: '-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEAgPEiGHOwFEUdo95/DaALH69umbFI4xD3Jmla0hiHbkcW535arBfFd8nJ\ns5VPt49sgdSgn1ZmiqmHLgMwMz6mKplu4GsmWj5mjdyxiNl5z6R2rF+ZziuiwRTeHVX/8zR8\nM7Cbh0QXmzpoq6LcNOFHbg495zsbmT9QAtjVsS1KyF5324mxbTZtjaD6hxJkAL8aVi0ikvhA\nL4HuZ1m3brjSSZ0+epFCFL7UIoJlFfOvap2sAyxdOrSvY2PXKTE00s51YTin5+CrvofRLCJP\nROls1oFkhXIDGfuTGTxMxe3hSUlNj0LjQi6RXPGat/5XH0nCuFTODmyhrnnnx51OdgT9vwID\nAQABAoIBAQAIAnKSwET0zWJM9po/12w5eKVPKMMVT816dlrs6Bcpk4LpuGCbhhJ/IWrFHAZK\nqb8cxX+AxlYyUNuT0SDiXgbmaIeJqz5DptKqB0aD8LZvXpD8nieote8zPT+a5Oe0TNNWRqcy\nnNk2jEdKOiChrEjKnlncDkDloRgwRRXpHp4hmh3XrZwygAekxC+LFhO5YS4fuc5tQAzGyl/O\nGKnEmOtRqz4bYQRTrrfhwtAWdMOC90AEtoIPapLnJPBUujHNn7KLktdrmlPSqxFilIIe3jJH\nH0oG9Nr9ueSNat54NQZr2BBrXliFqXu/SomiAfN0jmouB+8lzNYSoUK25JmbJQExAoGBANLE\nLqJS1DpLa3Mg/GMCeCbjWG6qwpLjJttFAG2F4Yst3elwr7EiSR4aEARFikFJXS2XX4Rf16FM\njI582Cfq3QuksJ3FHMXWv6qu+avROSYPTFrKkzLSD9qsALX5YlZRv/skwzpLeE7Vjy6g1y6E\ne7AwENVdJabWdRhlqKadCe/3AoGBAJydZUEGn7EKAG98XuXsrPrP1yVIdG7tdGEktXwjJ2Wi\nCCptWwNqH/cGU/Oxm60oDvE/z7DtsFMXKlLRisIV8UbRotQXNeEwe33bTXHAAnTaGXxJ8DxX\nddvPjnoeg7SqyaKxAZW4hP8BfKZJXEQtxcnPgXXpLpbEMH4giWhJwX55AoGBAKqqiUiP4aJC\nqANV1okl2r1Cor0aMOxYW4J6YVpOatAUl/kLcnjw1lw1pnqPBODQ006zoHjEUwsdvUMz/KR2\nHf/rn8hhcGcS+ajwfuOOS8Rx5tYt6vvf9U6QsRKpmeNj1x06K4vsyMKtU3/iZdwZEz8b7MWY\n44AxcCgNSX+A8icJAoGAI3VnVV+gjD7NdnBcNAZv66Fe/qv24J6WeOAMzvxOkS4sVx7HOnCu\nqAkgvM37hyrIp0phRZerEkTuai3TErpRFE2mZgqTQlbtvsMGN7jXVYmDt6Yt5BuRLaFCiteZ\nzi/U0ybsSu+p/OpjRGrbnvwWCekXUJDo4W2t5QCM27XHP1ECgYBbKYbcswxeBha2au4Cj3cf\nz7oW5khGNziJELJSG8ulUNtR0LkfS429JXWjo3qYVYPBeEPePoYE1qcrDnSQesYt2yq1y5Uh\nJjwAxK1wVGw9UcQl0w/utuDxcGCArlszFcRNPX1g/5e0F07OXM8bF9gQcom1HZBKgLaoLStI\nz94OOA==\n-----END RSA PRIVATE KEY-----\n',
  pubKey: '-----BEGIN RSA PUBLIC KEY-----\nMIIBCgKCAQEAgPEiGHOwFEUdo95/DaALH69umbFI4xD3Jmla0hiHbkcW535arBfFd8nJs5VP\nt49sgdSgn1ZmiqmHLgMwMz6mKplu4GsmWj5mjdyxiNl5z6R2rF+ZziuiwRTeHVX/8zR8M7Cb\nh0QXmzpoq6LcNOFHbg495zsbmT9QAtjVsS1KyF5324mxbTZtjaD6hxJkAL8aVi0ikvhAL4Hu\nZ1m3brjSSZ0+epFCFL7UIoJlFfOvap2sAyxdOrSvY2PXKTE00s51YTin5+CrvofRLCJPROls\n1oFkhXIDGfuTGTxMxe3hSUlNj0LjQi6RXPGat/5XH0nCuFTODmyhrnnnx51OdgT9vwIDAQAB\n-----END RSA PUBLIC KEY-----\n'
}

var testIdHex = '1220151ab1658d8294ab34b71d5582cfe20d06414212f440a69366f1bc31deb5c72d'

var testIdBytes = new Buffer('1220151ab1658d8294ab34b71d5582cfe20d06414212f440a69366f1bc31deb5c72d', 'hex')

var testIdB58String = 'QmPm2sunRFpswBAByqunK5Yk8PLj7mxL5HpCS4Qg6p7LdS'

test('create a new Id', function (t) {
  var id = PeerId.create()
  t.ok(id)
  t.end()
})

test('recreate an Id from Hex string', function (t) {
  var id = PeerId.createFromHexString(testIdHex)
  t.ok(id)
  t.end()
})

test('Recreate an Id from a Buffer', function (t) {
  var id = PeerId.createFromBytes(testIdBytes)
  t.ok(id)
  t.end()
})

test('Recreate an B58 String', function (t) {
  var id = PeerId.createFromB58String(testIdB58String)
  t.ok(id)
  t.end()
})

test('Recreate from a Public Key', function (t) {
  var id = PeerId.createFromPubKey(testId.pubKey)
  t.ok(id)
  t.end()
})

test('Recreate from a Private Key', function (t) {
  var id = PeerId.createFromPrivKey(testId.privKey)
  t.ok(id)
  t.end()
})
