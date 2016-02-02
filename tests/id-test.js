var test = require('tape')
var PeerId = require('../src')

var testId = {
  id: '1220151ab1658d8294ab34b71d5582cfe20d06414212f440a69366f1bc31deb5c72d',
  privKey: 'CAASqQkwggSlAgEAAoIBAQC1/m95i4waplpSl43/uefQClPfuguPsX6qa6pWE0Df+krs5p+RnhX+8j2aWBI9QZ0pliGryet5qM3in6J1ihb2LzjLUWIsWrMLxtqi/mQDjj1f0HfV11Q/k2v6yVgSgYJ+VoW51hCpAEdEnhthsbyKWMD6xVIvtkqOmK/FaxUMa2boWCVKsycf39U6GVaiuTk32btw6LqGMo8P1cehWDy80SOzv0qk2mD7ZJbKnVfVm8xwU+gzogasOFYs/LmKb4IEV9Otq0MHmWGUN0VyC82htoGBidheRs1Ssh7TDVtWlNTJSG1vJJV7cnIhpGKut2b0pMxhY1Sg0kn/VrfriXINAgMBAAECggEBAJrJuI4r/hF8gz3T4NYri9oJrqSOW97vG8heohVrcrYM70TmMblsN1ELPxHS7lBjSgRgyGqP5lMnG1UwaMCHnlfseeWTZmhLDBVsH/CZZP8RL2oaqJGb/u/Dtwcp0FqNBCvn8vzH8IuMzRCzWJ6SyMTyD9A5m1kxNeBqRLUoClLwZsLKuL8ld9sXfwmn1D1yY9sWLWCcrlPZnm4v49otc6Q9GYpurhOLBlQOqkEVqSyiN9N70bZ3QNPxWpAjKZS08X5PK0teI0b3uMZB9KwCdPkjMxHyymulyQ/bOkm1CCogFpGlG8abwyusIfrrjQOCeX+sUSei6/K/eN2kPLUUcoECgYEA0EKwQPq6mXmXiWqVMk08wz1JPqiNE9zreqaSOx9aOO/DbeR0xkfWjKy4RoCY9zo8FW0Y7jvwuEojm7LNZSrLrur3b2myfzHsdsjuo2t/fVilVrjtzxDEQSeBNOJasVdS+ZhB+/GHWfeZEcMjhXHkW9WRgMwIC/jTanmqLYy4nzkCgYEA37ZZJ+QH8+saafhztaSK/IC8pjJLTkHsMBjhSpVGm9TptpVdxHx/cHJdCDiHPfeP+TIPSOD//hGbHoTZuy2owZ0FJ2QFxyLpagEUch+Sy0f7fQZ+LoeUa1UJ9RsCbCCeKtcZvqZ0fuu9iWoR8LvJ7UI19SEyQ2T7Fymvbq3hFXUCgYEAsHHf7J3BHKjE97rifwSrV2sENF8Pb+W7aGXZ/NdaVGTm+aMWQKu6neL0GV94ufWP1ENjXOxRzYGa255IoM76VM9kJfOyNEuy4QzqCnDYSfWh13DEoqu86sqykIC6gAfRGACk3vVKTLIW8NKYtMXCyP+P0ESNCL+fN1WvFfpkrRkCgYEA3nriP6GvpwxwwGKt8D8rWeJNuprZ+YHl+g9EPoAmMGOV6laxYe7Obm3Nx5cwKJhDPnhiawAYlfu8YKWOQ3AtHB+kOIBonppBt4JLaxOrUS7NFJGYe32qRPPVa0TpK89kfQZePBQeVvrrC/XI0bhwINxv/NB+xDdw3qA+L7wM1OECgYA+3YgYJ6nbvT7s4DylRmyZ4AfOt3TcIjS3D0PDj4S4agZrvlPCKgn1LwBIFutjOe6V9lPSWZJiw6flfImhpWvQOap3zdT9gsU5PhbUmD3TndAk0n10+lmMYpGkU2UM/+zV5HsiZA5X+DPcVbSnIuNT/7pZdbD5uFF9Ibzoh022Fg==',
  pubKey: 'CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC1/m95i4waplpSl43/uefQClPfuguPsX6qa6pWE0Df+krs5p+RnhX+8j2aWBI9QZ0pliGryet5qM3in6J1ihb2LzjLUWIsWrMLxtqi/mQDjj1f0HfV11Q/k2v6yVgSgYJ+VoW51hCpAEdEnhthsbyKWMD6xVIvtkqOmK/FaxUMa2boWCVKsycf39U6GVaiuTk32btw6LqGMo8P1cehWDy80SOzv0qk2mD7ZJbKnVfVm8xwU+gzogasOFYs/LmKb4IEV9Otq0MHmWGUN0VyC82htoGBidheRs1Ssh7TDVtWlNTJSG1vJJV7cnIhpGKut2b0pMxhY1Sg0kn/VrfriXINAgMBAAE='
}

var testIdHex = '1220151ab1658d8294ab34b71d5582cfe20d06414212f440a69366f1bc31deb5c72d'

var testIdBytes = new Buffer('1220151ab1658d8294ab34b71d5582cfe20d06414212f440a69366f1bc31deb5c72d', 'hex')

var testIdB58String = 'QmPm2sunRFpswBAByqunK5Yk8PLj7mxL5HpCS4Qg6p7LdS'

test('create a new Id', function (t) {
  var id = PeerId.create()
  console.log(id.toPrint())
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
  t.ok(id.pubKey == testId.pubKey)
  t.end()
})

test('Recreate from a Private Key', function (t) {
  var id = PeerId.createFromPrivKey(testId.privKey)
  t.ok(id.pubKey == testId.pubKey)
  t.end()
})
