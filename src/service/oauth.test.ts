import { generateNonce, getTwitchToken, setTwitchToken } from './oauth'
import { getUserData, setUserData } from './users'

import type { Firestore } from 'firebase/firestore'
import type { User } from 'firebase/auth'
import type { UserData } from './users'

jest.mock('./users')

const mockedGetUserData = getUserData as jest.Mock<Promise<UserData>>
const mockedSetUserData = setUserData as jest.Mock<Promise<void>>

test('getTwitchToken gets twitch-access-token', async () => {
  const db = {} as Firestore
  const user = {} as User
  mockedGetUserData.mockResolvedValue({
    'twitch-access-token': 'token',
  })
  const token = await getTwitchToken(db, user)
  expect(token).toBe('token')
})

test('setTwitchToken gets twitch-access-token', async () => {
  const db = {} as Firestore
  const user = {} as User
  await setTwitchToken(db, user, 'token')
  expect(mockedSetUserData.mock.calls[0][1]).toBe(db)
  expect(mockedSetUserData.mock.calls[0][2]).toBe(user)
  expect(mockedSetUserData.mock.calls[0][3]).toEqual({
    'twitch-access-token': 'token',
  })
})

test('generateNonce returns crypto-based string', async () => {
  const _crypto = {
    getRandomValues(array: Uint32Array): Uint32Array {
      array[0] = 42
      return array
    },
  } as Crypto
  expect(generateNonce(_crypto)).toBe('0000002a')
})
