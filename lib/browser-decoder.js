module.exports = class UTF8Decoder {
  constructor (encoding) {
    this.decoder = new TextDecoder(encoding === 'utf16le' ? 'utf16-le' : encoding)
  }

  decode (data) {
    return this.decoder.decode(data, { stream: false })
  }

  flush () {
    return this.decoder.decode(new Uint8Array(0))
  }
}
