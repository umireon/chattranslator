import type { User } from 'firebase/auth'
import { setKeepAliveInterval } from './keepalive'

test('setKeepAliveInterval sends requests immediately adn sets interval', async () => {
  const idToken = Math.random().toString()
  const user = {
    async getIdToken() {
      return idToken
    },
  } as User
  const endpoints = ['endpoint1', 'endpoint2']
  const _fetch = jest.fn()
  const timer = await setKeepAliveInterval(user, endpoints, _fetch)
  clearInterval(timer)
  expect(_fetch.mock.calls[0][0]).toBe('endpoint1?keepAlive=true')
  expect(_fetch.mock.calls[0][1]).toEqual({
    headers: { authorization: `Bearer ${idToken}` },
  })
  expect(_fetch.mock.calls[1][0]).toBe('endpoint2?keepAlive=true')
  expect(_fetch.mock.calls[1][1]).toEqual({
    headers: { authorization: `Bearer ${idToken}` },
  })
  expect(timer).toBeDefined()
})
