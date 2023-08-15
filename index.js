const PassThroughDecoder = require('./lib/pass-through-decoder')
const UTF8Decoder = require('./lib/utf8-decoder')

module.exports = class TextDecoder {
  constructor (encoding = 'utf8') {
    this.encoding = normalizeEncoding(encoding)

    switch (this.encoding) {
      case 'utf8':
        this.decoder = new UTF8Decoder()
        break
      default:
        this.decoder = new PassThroughDecoder(this.encoding)
    }
  }

  push (data) {
    if (typeof data === 'string') return data
    return this.decoder.decode(data)
  }

  end (data) {
    let result = ''
    if (data) result = this.push(data)
    result += this.decoder.flush()
    return result
  }
}

function normalizeEncoding (encoding) {
  encoding = encoding.toLowerCase()

  switch (encoding) {
    case 'utf8':
    case 'utf-8':
      return 'utf8'
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return 'utf16le'
    case 'latin1':
    case 'binary':
      return 'latin1'
    case 'base64':
    case 'ascii':
    case 'hex':
      return encoding
    default:
      throw new Error('Unknown encoding: ' + encoding)
  }
};
