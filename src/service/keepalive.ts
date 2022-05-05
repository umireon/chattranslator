import { User } from 'firebase/auth'

export const setKeepAliveInterval = (user: User, endpoints: string[]) => {
  const query = new URLSearchParams({ keepAlive: 'true' })
  const sendKeepAlive = async () => {
    const idToken = await user.getIdToken()
    for (const endpoint of endpoints) {
      fetch(`${endpoint}?${query}`, {
        headers: {
          authorization: `Bearer ${idToken}`,
        },
      })
    }
  }
  setInterval(sendKeepAlive, 60000)
  sendKeepAlive()
}
