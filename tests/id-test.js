var test = require('tape')
var PeerId = require('../src')

var testId = {
  id: '1220151ab1658d8294ab34b71d5582cfe20d06414212f440a69366f1bc31deb5c72d',
  privKey: 'CAASpgkwggSiAgEAAoIBAQC2SKo/HMFZeBml1AF3XijzrxrfQXdJzjePBZAbdxqKR1Mc6juRHXij6HXYPjlAk01BhF1S3Ll4Lwi0cAHhggf457sMg55UWyeGKeUv0ucgvCpBwlR5cQ020i0MgzjPWOLWq1rtvSbNcAi2ZEVn6+Q2EcHo3wUvWRtLeKz+DZSZfw2PEDC+DGPJPl7f8g7zl56YymmmzH9liZLNrzg/qidokUv5u1pdGrcpLuPNeTODk0cqKB+OUbuKj9GShYECCEjaybJDl9276oalL9ghBtSeEv20kugatTvYy590wFlJkkvyl+nPxIH0EEYMKK9XRWlu9XYnoSfboiwcv8M3SlsjAgMBAAECggEAZtju/bcKvKFPz0mkHiaJcpycy9STKphorpCT83srBVQi59CdFU6Mj+aL/xt0kCPMVigJw8P3/YCEJ9J+rS8BsoWE+xWUEsJvtXoT7vzPHaAtM3ci1HZd302Mz1+GgS8Epdx+7F5p80XAFLDUnELzOzKftvWGZmWfSeDnslwVONkL/1VAzwKy7Ce6hk4SxRE7l2NE2OklSHOzCGU1f78ZzVYKSnS5Ag9YrGjOAmTOXDbKNKN/qIorAQ1bovzGoCwx3iGIatQKFOxyVCyO1PsJYT7JO+kZbhBWRRE+L7l+ppPER9bdLFxs1t5CrKc078h+wuUr05S1P1JjXk68pk3+kQKBgQDeK8AR11373Mzib6uzpjGzgNRMzdYNuExWjxyxAzz53NAR7zrPHvXvfIqjDScLJ4NcRO2TddhXAfZoOPVH5k4PJHKLBPKuXZpWlookCAyENY7+Pd55S8r+a+MusrMagYNljb5WbVTgN8cgdpim9lbbIFlpN6SZaVjLQL3J8TWH6wKBgQDSChzItkqWX11CNstJ9zJyUE20I7LrpyBJNgG1gtvz3ZMUQCn3PxxHtQzN9n1P0mSSYs+jBKPuoSyYLt1wwe10/lpgL4rkKWU3/m1Myt0tveJ9WcqHh6tzcAbb/fXpUFT/o4SWDimWkPkuCb+8j//2yiXk0a/T2f36zKMuZvujqQKBgC6B7BAQDG2H2B/ijofp12ejJU36nL98gAZyqOfpLJ+FeMz4TlBDQ+phIMhnHXA5UkdDapQ+zA3SrFk+6yGk9Vw4Hf46B+82SvOrSbmnMa+PYqKYIvUzR4gg34rL/7AhwnbEyD5hXq4dHwMNsIDq+l2elPjwm/U9V0gdAl2+r50HAoGALtsKqMvhv8HucAMBPrLikhXP/8um8mMKFMrzfqZ+otxfHzlhI0L08Bo3jQrb0Z7ByNY6M8epOmbCKADsbWcVre/AAY0ZkuSZK/CaOXNX/AhMKmKJh8qAOPRY02LIJRBCpfS4czEdnfUhYV/TYiFNnKRj57PPYZdTzUsxa/yVTmECgYBr7slQEjb5Onn5mZnGDh+72BxLNdgwBkhO0OCdpdISqk0F0Pxby22DFOKXZEpiyI9XYP1C8wPiJsShGm2yEwBPWXnrrZNWczaVuCbXHrZkWQogBDG3HGXNdU4MAWCyiYlyinIBpPpoAJZSzpGLmWbMWh28+RJS6AQX6KHrK1o2uw==',
  pubKey: 'CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC2SKo/HMFZeBml1AF3XijzrxrfQXdJzjePBZAbdxqKR1Mc6juRHXij6HXYPjlAk01BhF1S3Ll4Lwi0cAHhggf457sMg55UWyeGKeUv0ucgvCpBwlR5cQ020i0MgzjPWOLWq1rtvSbNcAi2ZEVn6+Q2EcHo3wUvWRtLeKz+DZSZfw2PEDC+DGPJPl7f8g7zl56YymmmzH9liZLNrzg/qidokUv5u1pdGrcpLuPNeTODk0cqKB+OUbuKj9GShYECCEjaybJDl9276oalL9ghBtSeEv20kugatTvYy590wFlJkkvyl+nPxIH0EEYMKK9XRWlu9XYnoSfboiwcv8M3SlsjAgMBAAE='
  //pubKey: 'CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC1/m95i4waplpSl43/uefQClPfuguPsX6qa6pWE0Df+krs5p+RnhX+8j2aWBI9QZ0pliGryet5qM3in6J1ihb2LzjLUWIsWrMLxtqi/mQDjj1f0HfV11Q/k2v6yVgSgYJ+VoW51hCpAEdEnhthsbyKWMD6xVIvtkqOmK/FaxUMa2boWCVKsycf39U6GVaiuTk32btw6LqGMo8P1cehWDy80SOzv0qk2mD7ZJbKnVfVm8xwU+gzogasOFYs/LmKb4IEV9Otq0MHmWGUN0VyC82htoGBidheRs1Ssh7TDVtWlNTJSG1vJJV7cnIhpGKut2b0pMxhY1Sg0kn/VrfriXINAgMBAAE='
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
  t.ok(id.pubKey == testId.pubKey)
  t.end()
})

test('Recreate from a Private Key', function (t) {
  var id = PeerId.createFromPrivKey(testId.privKey)
  t.ok(id.pubKey == testId.pubKey)
  t.end()
})
