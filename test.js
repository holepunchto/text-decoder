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

  t.is(td.push(Buffer.of(0xa2)), '¢')
  t.is(td.remaining, 0)

  t.is(td.push('hello world'), 'hello world', 'remainder')
})

test('utf8, 3-byte character', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xe2)), '')
  t.is(td.remaining, 1)

  t.is(td.push(Buffer.of(0x82)), '')
  t.is(td.remaining, 2)

  t.is(td.push(Buffer.of(0xac)), '€')
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

  t.is(td.push(Buffer.of(0xa9)), '💩')
  t.is(td.remaining, 0)

  t.is(td.push('hello world'), 'hello world', 'remainder')
})

test('utf8, invalid continuation byte', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xf0, 0x80, 0x80)), '���')
  t.is(td.remaining, 1)
  td.end()

  t.is(td.push(Buffer.of(0xf0, 0x80, 0x80, 0x2a, 0x2a)), '���**')
  t.is(td.remaining, 0)
  td.end()

  t.is(td.push(Buffer.of(0xf0, 0x90, 0x80, 0x2a, 0x2a)), '�**')
  t.is(td.remaining, 0)
})
