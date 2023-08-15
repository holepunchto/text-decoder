module.exports = class PassThroughDecoder {
  constructor (encoding) {
    this.encoding = encoding
  }

  decode (tail) {
    return tail.toString(this.encoding)
  }

  flush () {
    return ''
  }
}
