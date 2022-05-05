import type { AppContext } from '../../common/constants'
import type { User } from 'firebase/auth'
import { translateText } from './translate'

test('translateText returns a translated text', async () => {
  const context = {
    translateTextEndpoint: 'endpoint',
  } as AppContext
  const user = {
    async getIdToken() {
      return 'idToken'
    },
  } as User
  const targetLanguageCode = 'lang'
  const text = 'text'
  const expected = { translatedText: 'translatedText' }
  const _fetch = jest.fn().mockImplementation((input, init) => {
    expect(input).toBe('endpoint?targetLanguageCode=lang&text=text')
    expect(init).toEqual({ headers: { authorization: `Bearer idToken` } })
    return {
      async json() {
        return expected
      },
      ok: true,
    }
  })
  const actual = await translateText(
    context,
    user,
    { targetLanguageCode, text },
    _fetch
  )
  expect(actual).toBe(expected)
})
