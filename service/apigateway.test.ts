import { getUidFromBase64 } from './apigateway'

test('getUidFromBase64 returns sub from base64 JWT', () => {
  const jwt = { sub: 'uid' }
  const jwtBase64 = Buffer.from(JSON.stringify(jwt)).toString('base64')
  expect(getUidFromBase64(jwtBase64)).toBe('uid')
})
