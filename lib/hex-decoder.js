const { toHex } = require('@exodus/bytes/hex.js')

module.exports = class HexDecoder {
  get remaining() {
    return 0
  }

  decode(tail) {
    return toHex(tail)
  }

  flush() {
    return ''
  }
}
