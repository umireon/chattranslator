import type { Auth, UserCredential } from 'firebase/auth'
import type { AppContext } from '../../common/constants'
import { authenticateWithToken } from './auth'
import { signInWithCustomToken } from 'firebase/auth'

jest.mock('firebase/auth')

test('sendTextFromBotToChat resolves if request succeeds', async () => {
  const context = {
    authenticateWithTokenEndpoint: 'endpoint',
  } as AppContext
  const auth = {} as Auth
  const token = 'token'
  const uid = 'uid'
  const responseText = jest.fn().mockResolvedValue('customToken')
  const response = { ok: true, text: responseText }
  const _fetch = jest.fn().mockResolvedValue(response)
  const mockedSignInWithCustomToken = signInWithCustomToken as jest.Mock<Promise<UserCredential>>
  const credential = {} as UserCredential
  mockedSignInWithCustomToken.mockResolvedValue(credential)
  const actual = await authenticateWithToken(context, auth, { token, uid }, _fetch)
  expect(_fetch.mock.calls[0][0]).toBe('endpoint?token=token&uid=uid')
  expect(responseText.mock.calls.length).toBe(1)
  expect(actual).toBe(credential)
})