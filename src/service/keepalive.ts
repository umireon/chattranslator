import type { User } from 'firebase/auth'

export const setKeepAliveInterval = (
  user: User,
  endpoints: string[],
  _fetch = fetch
) => {
  const query = new URLSearchParams({ keepAlive: 'true' })
  const sendKeepAlive = async () => {
    const idToken = await user.getIdToken()
    for (const endpoint of endpoints) {
      _fetch(`${endpoint}?${query}`, {
        headers: {
          authorization: `Bearer ${idToken}`,
        },
      })
    }
  }
  sendKeepAlive()
  return setInterval(sendKeepAlive, 60000)
}
