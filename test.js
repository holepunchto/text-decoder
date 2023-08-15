const test = require('brittle')
const TextDecoder = require('.')

test('utf8, 1-byte characters', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.from('hello world')), 'hello world')
})

test('utf8, 2-byte character', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xc2)), '')
  t.is(td.push(Buffer.of(0xa2)), '¢')
})

test('utf8, 3-byte character', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xe2)), '')
  t.is(td.push(Buffer.of(0x82)), '')
  t.is(td.push(Buffer.of(0xac)), '€')
})

test('utf8, 4-byte character', (t) => {
  const td = new TextDecoder()

  t.is(td.push(Buffer.of(0xf0)), '')
  t.is(td.push(Buffer.of(0x9f)), '')
  t.is(td.push(Buffer.of(0x92)), '')
  t.is(td.push(Buffer.of(0xa9)), '💩')
})
