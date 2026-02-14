const test = require('brittle')
const TextDecoder = require('.')

test('utf8, 1-byte characters', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.from('hello world')), 'hello world')
  t.is(td.remaining, 0)
})

test('utf8, 2-byte character', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xc2)), '')
  t.is(td.remaining, 1)

  t.is(td.push(Buffer.of(0xa2)), '\u00a2')
  t.is(td.remaining, 0)

  t.is(td.push('hello world'), 'hello world', 'remainder')
})

test('utf8, 3-byte character', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xe2)), '')
  t.is(td.remaining, 1)

  t.is(td.push(Buffer.of(0x82)), '')
  t.is(td.remaining, 2)

  t.is(td.push(Buffer.of(0xac)), '\u20ac')
  t.is(td.remaining, 0)

  t.is(td.push('hello world'), 'hello world', 'remainder')
})

test('utf8, 4-byte character', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xf0)), '')
  t.is(td.remaining, 1)

  t.is(td.push(Buffer.of(0x9f)), '')
  t.is(td.remaining, 2)

  t.is(td.push(Buffer.of(0x92)), '')
  t.is(td.remaining, 3)

  t.is(td.push(Buffer.of(0xa9)), '\ud83d\udca9')
  t.is(td.remaining, 0)

  t.is(td.push('hello world'), 'hello world', 'remainder')
})

test('utf8, invalid continuation byte', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xf0, 0x80, 0x80)), '\ufffd\ufffd\ufffd')
  t.is(td.remaining, 1)
  td.end()

  t.is(td.push(Buffer.of(0xf0, 0x80, 0x80, 0x2a, 0x2a)), '\ufffd\ufffd\ufffd**')
  t.is(td.remaining, 0)
  td.end()

  t.is(td.push(Buffer.of(0xf0, 0x90, 0x80, 0x2a, 0x2a)), '\ufffd**')
  t.is(td.remaining, 0)
})

test('utf8, empty buffer', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.alloc(0)), '')
  t.is(td.remaining, 0)
})

test('utf8, empty buffer does not disrupt pending state', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xc2)), '')
  t.is(td.remaining, 1)

  t.is(td.push(Buffer.alloc(0)), '')
  t.is(td.remaining, 1)

  t.is(td.push(Buffer.of(0xa2)), '\u00a2')
  t.is(td.remaining, 0)
})

test('utf8, flush with no pending state', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.from('abc')), 'abc')
  t.is(td.end(), '')
})

test('utf8, flush with pending 2-byte', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xc2)), '')
  t.is(td.end(), '\ufffd')
  t.is(td.remaining, 0)
})

test('utf8, flush with pending 3-byte (1 byte seen)', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xe2)), '')
  t.is(td.end(), '\ufffd')
  t.is(td.remaining, 0)
})

test('utf8, flush with pending 3-byte (2 bytes seen)', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xe2, 0x82)), '')
  t.is(td.end(), '\ufffd')
  t.is(td.remaining, 0)
})

test('utf8, flush with pending 4-byte', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xf0, 0x9f, 0x92)), '')
  t.is(td.end(), '\ufffd')
  t.is(td.remaining, 0)
})

test('utf8, flush resets state for next use', (t) => {
  const td = new TextDecoder()

  td.push(Buffer.of(0xc2))
  td.end()

  t.is(td.push(Buffer.from('ok')), 'ok')
  t.is(td.remaining, 0)
})

test('utf8, 2-byte split across two larger chunks', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0x41, 0xc2)), 'A')
  t.is(td.remaining, 1)

  t.is(td.push(Buffer.of(0xa2, 0x42)), '\u00a2B')
  t.is(td.remaining, 0)
})

test('utf8, 3-byte split across two chunks', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xe2, 0x82)), '')
  t.is(td.remaining, 2)

  t.is(td.push(Buffer.of(0xac, 0x21)), '\u20ac!')
  t.is(td.remaining, 0)
})

test('utf8, 4-byte split across two chunks', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0x41, 0xf0, 0x9f)), 'A')

  t.is(td.push(Buffer.of(0x92, 0xa9, 0x42)), '\ud83d\udca9B')
  t.is(td.remaining, 0)
})

test('utf8, 4-byte split across three chunks', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xf0, 0x9f)), '')
  t.is(td.remaining, 2)

  t.is(td.push(Buffer.of(0x92)), '')
  t.is(td.remaining, 3)

  t.is(td.push(Buffer.of(0xa9)), '\ud83d\udca9')
  t.is(td.remaining, 0)
})

test('utf8, multiple multi-byte characters in one buffer', (t) => {
  const td = new TextDecoder()

  const buf = Buffer.of(0xc2, 0xa2, 0xe2, 0x82, 0xac, 0xf0, 0x9f, 0x92, 0xa9)
  t.is(td.push(buf), '\u00a2\u20ac\ud83d\udca9')
  t.is(td.remaining, 0)
})

test('utf8, ASCII fast path', (t) => {
  const td = new TextDecoder()

  const buf = Buffer.from('The quick brown fox jumps over the lazy dog')
  t.is(td.push(buf), 'The quick brown fox jumps over the lazy dog')
  t.is(td.remaining, 0)
})

test('utf8, overlong 2-byte sequences', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xc0, 0x80)), '\ufffd\ufffd')

  t.is(td.push(Buffer.of(0xc1, 0x80)), '\ufffd\ufffd')
})

test('utf8, overlong 3-byte sequence', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xe0, 0x80, 0x80)), '\ufffd\ufffd\ufffd')
  td.end()

  t.is(td.push(Buffer.of(0xe0, 0x9f, 0x80)), '\ufffd\ufffd\ufffd')
})

test('utf8, overlong 4-byte sequence', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xf0, 0x80, 0x80, 0x80)), '\ufffd\ufffd\ufffd\ufffd')
})

test('utf8, surrogate halves', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xed, 0xa0, 0x80)), '\ufffd\ufffd\ufffd')
  td.end()

  t.is(td.push(Buffer.of(0xed, 0xbf, 0xbf)), '\ufffd\ufffd\ufffd')
})

test('utf8, valid 3-byte near surrogate boundary', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xed, 0x9f, 0xbf)), '\ud7ff')

  t.is(td.push(Buffer.of(0xee, 0x80, 0x80)), '\ue000')
})

test('utf8, above U+10FFFF', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xf4, 0x90, 0x80, 0x80)), '\ufffd\ufffd\ufffd\ufffd')
})

test('utf8, valid U+10FFFF', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xf4, 0x8f, 0xbf, 0xbf)), '\udbff\udfff')
  t.is(td.remaining, 0)
})

test('utf8, valid U+10000', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xf0, 0x90, 0x80, 0x80)), '\ud800\udc00')
  t.is(td.remaining, 0)
})

test('utf8, invalid lead bytes', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xf5)), '\ufffd')
  t.is(td.push(Buffer.of(0xfe)), '\ufffd')
  t.is(td.push(Buffer.of(0xff)), '\ufffd')
})

test('utf8, interrupted 2-byte by new 2-byte', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xc2, 0xc2, 0xa2)), '\ufffd\u00a2')
})

test('utf8, interrupted 3-byte by ASCII', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xe2, 0x41)), '\ufffdA')
})

test('utf8, interrupted 4-byte by valid 2-byte', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xf0, 0x9f, 0xc2, 0xa2)), '\ufffd\u00a2')
})

test('utf8, interrupted sequence across chunks', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xe2)), '')
  t.is(td.remaining, 1)

  t.is(td.push(Buffer.of(0x41, 0x42)), '\ufffdAB')
  t.is(td.remaining, 0)
})

test('utf8, interrupted sequence across chunks by new multi-byte', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xe2)), '')

  t.is(td.push(Buffer.of(0xc2, 0xa2)), '\ufffd\u00a2')
  t.is(td.remaining, 0)
})

test('utf8, lone continuation bytes', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0x80)), '\ufffd')
  t.is(td.push(Buffer.of(0xbf)), '\ufffd')
  t.is(td.push(Buffer.of(0x80, 0x80, 0x80)), '\ufffd\ufffd\ufffd')
})

test('utf8, e0 boundary validation', (t) => {
  const td = new TextDecoder()

  t.is(
    td.push(Buffer.of(0xe0, 0xa0, 0x80)),
    '\u0800',
    'valid e0 a0 80 = U+0800'
  )
  t.is(
    td.push(Buffer.of(0xe0, 0x9f, 0x80)),
    '\ufffd\ufffd\ufffd',
    'invalid e0 9f 80'
  )
})

test('utf8, f0 boundary validation', (t) => {
  const td = new TextDecoder()

  t.is(
    td.push(Buffer.of(0xf0, 0x90, 0x80, 0x80)),
    '\ud800\udc00',
    'valid f0 90 80 80 = U+10000'
  )
  td.end()

  t.is(
    td.push(Buffer.of(0xf0, 0x8f, 0x80, 0x80)),
    '\ufffd\ufffd\ufffd\ufffd',
    'invalid f0 8f 80 80'
  )
})

test('utf8, f4 boundary validation', (t) => {
  const td = new TextDecoder()

  t.is(
    td.push(Buffer.of(0xf4, 0x8f, 0xbf, 0xbf)),
    '\udbff\udfff',
    'valid f4 8f bf bf = U+10FFFF'
  )
  td.end()

  t.is(
    td.push(Buffer.of(0xf4, 0x90, 0x80, 0x80)),
    '\ufffd\ufffd\ufffd\ufffd',
    'invalid f4 90 80 80'
  )
})

test('utf8, ed boundary validation', (t) => {
  const td = new TextDecoder()

  t.is(
    td.push(Buffer.of(0xed, 0x9f, 0xbf)),
    '\ud7ff',
    'valid ed 9f bf = U+D7FF'
  )
  td.end()

  t.is(
    td.push(Buffer.of(0xed, 0xa0, 0x80)),
    '\ufffd\ufffd\ufffd',
    'invalid ed a0 80 = U+D800'
  )
})

test('utf8, boundary validation across chunks for e0', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xe0)), '')
  t.is(td.push(Buffer.of(0x80)), '\ufffd\ufffd')
  td.end()

  t.is(td.push(Buffer.of(0xe0)), '')
  t.is(td.push(Buffer.of(0xa0, 0x80)), '\u0800')
})

test('utf8, boundary validation across chunks for f0', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xf0)), '')
  t.is(td.push(Buffer.of(0x80, 0x80)), '\ufffd\ufffd\ufffd')
  td.end()

  t.is(td.push(Buffer.of(0xf0)), '')
  t.is(td.push(Buffer.of(0x90, 0x80, 0x80)), '\ud800\udc00')
})

test('utf8, boundary validation across chunks for f4', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xf4)), '')
  t.is(td.push(Buffer.of(0x90, 0x80, 0x80)), '\ufffd\ufffd\ufffd\ufffd')
})

test('utf8, boundary validation across chunks for ed', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xed)), '')
  t.is(td.push(Buffer.of(0xa0, 0x80)), '\ufffd\ufffd\ufffd')
})

test('utf8, BOM', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xef, 0xbb, 0xbf)), '\ufeff')
})

test('utf8, mixed valid and invalid in one buffer', (t) => {
  const td = new TextDecoder()

  const buf = Buffer.of(0x41, 0xff, 0x42, 0xc2, 0xa2, 0x80, 0x43)
  t.is(td.push(buf), 'A\ufffdB\u00a2\ufffdC')
})

test('utf8, all single-byte values 0x00-0x7f', (t) => {
  const td = new TextDecoder()

  const buf = Buffer.alloc(128)
  for (let i = 0; i < 128; i++) buf[i] = i
  const expected = Array.from({ length: 128 }, (_, i) =>
    String.fromCharCode(i)
  ).join('')
  t.is(td.push(buf), expected)
})

test('utf8, valid 2-byte range boundaries', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xc2, 0x80)), '\u0080')
  t.is(td.push(Buffer.of(0xdf, 0xbf)), '\u07ff')
})

test('utf8, null byte', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0x00)), '\x00')
  t.is(td.remaining, 0)
})

test('utf8, single byte buffer after pending completes sequence', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xf0, 0x9f, 0x92)), '')
  t.is(td.remaining, 3)

  t.is(td.push(Buffer.of(0xa9)), '\ud83d\udca9')
  t.is(td.remaining, 0)
})

test('utf8, large buffer with trailing multi-byte', (t) => {
  const td = new TextDecoder()

  const buf = Buffer.alloc(102)
  buf.fill(0x41) // A
  buf[100] = 0xe2
  buf[101] = 0x82
  const result = td.push(buf)
  t.is(result, 'A'.repeat(100))
  t.is(td.remaining, 2)

  t.is(td.push(Buffer.of(0xac)), '\u20ac')
  t.is(td.remaining, 0)
})

test('utf8, pending sequence followed by buffer that starts with invalid then valid', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xc2)), '')

  t.is(td.push(Buffer.of(0xff, 0x41, 0x42)), '\ufffd\ufffdAB')
  t.is(td.remaining, 0)
})

test('utf8, consecutive flush calls', (t) => {
  const td = new TextDecoder()

  t.is(td.end(), '', 'flush with nothing pending')
  t.is(td.end(), '', 'second flush is also empty')
  t.is(td.remaining, 0)
})

test('utf8, multiple incomplete sequences flushed', (t) => {
  const td = new TextDecoder()

  td.push(Buffer.of(0xc2))
  t.is(td.end(), '\ufffd', 'flush pending 2-byte')

  td.push(Buffer.of(0xe2))
  t.is(td.end(), '\ufffd', 'flush pending 3-byte')

  td.push(Buffer.of(0xf0, 0x9f))
  t.is(td.end(), '\ufffd', 'flush pending 4-byte')

  t.is(td.push(Buffer.from('ok')), 'ok')
})
