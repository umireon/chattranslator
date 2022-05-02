import { AppContext, DEFAULT_CONTEXT, firebaseConfig } from '../constants'
import { getAnalytics, logEvent } from 'firebase/analytics'

import type { User } from 'firebase/auth'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getUserData } from './service/users'
import { initializeApp } from 'firebase/app'
import { setTwitchToken } from './service/oauth'

import 'three-dots/dist/three-dots.min.css'

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const analytics = getAnalytics(app)

interface SetTwitchLoginToUserParams {
  token: string
}

const setTwitchLoginToUser = async (
  { setTwitchLoginToUserEndpoint }: AppContext,
  user: User,
  { token }: SetTwitchLoginToUserParams
): Promise<void> => {
  const idToken = await user.getIdToken()
  const query = new URLSearchParams({ token })
  const response = await fetch(`${setTwitchLoginToUserEndpoint}?${query}`, {
    headers: {
      authorization: `Bearer ${idToken}`,
    },
  })
  if (!response.ok) throw new Error('Could not set Twitch login to user!')
}

auth.onAuthStateChanged(async (user) => {
  if (user) {
    const params = new URLSearchParams(location.hash.slice(1))

    const token = params.get('access_token')
    if (!token) throw new Error('access_token missing')

    const userData = await getUserData(db, user)
    if (typeof userData.nonce === 'undefined')
      throw new Error('Nonce not stored')
    const expectedState = userData.nonce
    const actualState = params.get('state')
    if (actualState !== expectedState) throw new Error('Nonce does not match')

    await setTwitchToken(db, user, token)
    await setTwitchLoginToUser(DEFAULT_CONTEXT, user, { token })
    logEvent(analytics, 'twitch_connected')
    location.href = 'app.html'
  }
})

setTimeout(() => {
  const resetElement = document.querySelector('button')
  if (resetElement === null) throw new Error('Reset button not found')
  resetElement.disabled = false
}, 20000)
