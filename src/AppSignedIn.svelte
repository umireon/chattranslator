<script lang="ts">
  import type { Auth, User } from 'firebase/auth'
  import { connectTwitch } from './service/twitch'
  import { getUserData, setUserData } from './service/users'

  import type { Analytics } from 'firebase/analytics'
  import type { AppContext } from '../constants'
  import Connect from './lib/Connect.svelte'
  import { DEFAULT_CONTEXT } from '../constants'
  import type { Firestore } from 'firebase/firestore'
  import GenerateUrl from './lib/GenerateUrl.svelte'
  import Logout from './lib/Logout.svelte'
  import Toastify from 'toastify-js'
  import type { UserData } from './service/users'
  import { getTwitchLogin } from '../service'
  import { getTwitchToken } from './service/oauth'
  import { sendTextFromBotToChat } from './service/bot'
  import { setKeepAliveInterval } from './service/keepalive'
  import { translateText } from './service/translate'

  import 'three-dots/dist/three-dots.min.css'
  import 'toastify-js/src/toastify.css'

  export let analytics: Analytics
  export let auth: Auth
  export let db: Firestore

  export let user: User
  export let initialUserData: UserData

  const context = DEFAULT_CONTEXT

  let targetLanguageCode = initialUserData.targetLanguageCode || 'en'

  $: setUserData(db, user, { targetLanguageCode })

  export const translateChat = async (text: string) => {
    const userData = await getUserData(db, user)
    if (typeof userData.targetLanguageCode === 'undefined') {
      console.error(userData)
      throw new Error('targetLanguageCode missing')
    }
    targetLanguageCode = userData.targetLanguageCode

    const { detectedLanguageCode, translatedText } = await translateText(
      context,
      user,
      {
        targetLanguageCode,
        text,
      }
    )
    if (detectedLanguageCode !== targetLanguageCode) {
      await sendTextFromBotToChat(context, user, { text: translatedText })
    }
  }

  const initializeTwitch = async (context: AppContext) => {
    const token = await getTwitchToken(db, user)
    if (typeof token === 'undefined') return
    const login = await getTwitchLogin(context, token).catch((e) => {
      Toastify({ text: e.toString() }).showToast()
    })
    if (typeof login === 'undefined') return
    connectTwitch({ login, token }, translateChat)
  }

  initializeTwitch(DEFAULT_CONTEXT)

  setKeepAliveInterval(user, [
    context.sendTextFromBotToChatEndpoint,
    context.translateTextEndpoint,
  ])
</script>

<main>
  <Connect {context} {db} {user} />
  <GenerateUrl {db} {user} />
  <Logout {auth} />
</main>
