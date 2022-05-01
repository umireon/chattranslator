<script lang="ts">
  import type { Auth, User } from 'firebase/auth'
  import { connectTwitch, getTwitchLogin } from './service/twitch'

  import type { Analytics } from 'firebase/analytics'
  import Connect from './lib/Connect.svelte'
  import { DEFAULT_CONTEXT } from '../constants'
  import type { Firestore } from 'firebase/firestore'
  import GenerateUrl from './lib/GenerateUrl.svelte'
  import Logout from './lib/Logout.svelte'
  import Toastify from 'toastify-js'
  import type { UserData } from './service/users'
  import { getTwitchToken } from './service/oauth'
  import { sendKeepAliveToTextToSpeech } from './service/audio'

  import 'three-dots/dist/three-dots.min.css'
  import 'toastify-js/src/toastify.css'

  export let analytics: Analytics
  export let auth: Auth
  export let db: Firestore

  export let user: User
  export let initialUserData: UserData

  const context = DEFAULT_CONTEXT

  async function initializeTwitch () {
    const token = await getTwitchToken(db, user)
    if (typeof token === 'undefined') return
    const login = await getTwitchLogin(DEFAULT_CONTEXT, token)
      .catch(e => {
        Toastify({ text: e.toString() }).showToast()
      })
    if (typeof login === 'undefined') return
    connectTwitch({ login, token }, (text: string) => {})
  }

  initializeTwitch()

  setInterval(() => {
    sendKeepAliveToTextToSpeech(DEFAULT_CONTEXT, user)
  }, 60000)
  sendKeepAliveToTextToSpeech(DEFAULT_CONTEXT, user)
</script>

<main>
  <Connect {context} {db} {user} />
  <GenerateUrl {db} {user} />
  <Logout {auth} />
</main>