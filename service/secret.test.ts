import * as util from 'util';
import { coarseIntoString } from './secret'

const _TextDecoder = util.TextDecoder as typeof TextDecoder

test('coarseIntoString converts Uint8Array into string', () => {
  const array = new Uint8Array([65])
  const actual = coarseIntoString(array, _TextDecoder)
  expect(actual).toBe('A')
})

test('coarseIntoString does nothing with string', () => {
  const string = 'A'
  const actual = coarseIntoString(string, _TextDecoder)
  expect(actual).toBe(string)
})
