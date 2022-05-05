import type { User } from 'firebase/auth'
import { setKeepAliveInterval } from './keepalive'

test('setKeepAliveInterval sends requests immediately adn sets interval', async () => {
  const user = {
    async getIdToken() {
      return 'idToken'
    },
  } as User
  const endpoints = ['endpoint1', 'endpoint2']
  const _fetch = jest
    .fn()
    .mockImplementationOnce((input, init) => {
      expect(input).toBe('endpoint1?keepAlive=true')
      expect(init).toEqual({ headers: { authorization: `Bearer idToken` } })
    })
    .mockImplementationOnce((input, init) => {
      expect(input).toBe('endpoint2?keepAlive=true')
      expect(init).toEqual({ headers: { authorization: `Bearer idToken` } })
    })
  const timer = setKeepAliveInterval(user, endpoints, _fetch)
  expect(timer).toBeDefined()
  clearInterval(timer)
})
