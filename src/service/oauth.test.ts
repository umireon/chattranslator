import { generateNonce } from './oauth'

test('generateNonce returns crypto-based string', async () => {
  const _crypto = {
    getRandomValues(array: Uint32Array): Uint32Array {
      array[0] = 42
      return array
    },
  } as Crypto
  expect(generateNonce(_crypto)).toBe('0000002a')
})
