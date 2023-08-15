const test = require('brittle')
const TextDecoder = require('..')

test('text-decoder', (t) => {
  const decoder = new TextDecoder('utf8')

  decoder.push(Buffer.alloc(65536, 'hello world'))
})

test('string_decoder', (t) => {
  const { StringDecoder } = require('string_decoder')

  const decoder = new StringDecoder('utf8')

  decoder.write(Buffer.alloc(65536, 'hello world'))
})
