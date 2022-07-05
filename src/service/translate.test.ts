import type { AppContext } from '../../common/constants'
import type { User } from 'firebase/auth'
import { translateText } from './translate'

test('translateText returns a translated text', async () => {
  const context = {
    translateTextEndpoint: 'endpoint',
  } as AppContext
  const idToken = 'idToken'
  const user = {
    async getIdToken() {
      return idToken
    },
  } as User
  const targetLanguageCode = 'lang'
  const text = 'text'
  const expected = { translatedText: 'translatedText' }
  const _fetch = jest.fn().mockResolvedValue({
    async json() {
      return expected
    },
    ok: true,
  })
  const actual = await translateText(
    context,
    user,
    { targetLanguageCode, text },
    _fetch
  )
  expect(_fetch.mock.calls[0][0]).toBe(
    'endpoint?targetLanguageCode=lang&text=text'
  )
  expect(_fetch.mock.calls[0][1]).toEqual({
    headers: { authorization: `Bearer ${idToken}` },
  })
  expect(actual).toBe(expected)
})
