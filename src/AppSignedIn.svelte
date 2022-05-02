<script lang="ts">
  import type { Auth, User } from 'firebase/auth'
  import { connectTwitch, getTwitchLogin } from './service/twitch'
  import { getUserData, setUserData } from './service/users'

  import type { Analytics } from 'firebase/analytics'
  import type { AppContext } from '../constants'
  import Connect from './lib/Connect.svelte'
  import { DEFAULT_CONTEXT } from '../constants'
  import type { Firestore } from 'firebase/firestore'
  import GenerateUrl from './lib/GenerateUrl.svelte'
  import Logout from './lib/Logout.svelte'
  import Toastify from 'toastify-js'
  import type { TranslateTextResult } from '../types'
  import type { UserData } from './service/users'
  import { getTwitchToken } from './service/oauth'

  import 'three-dots/dist/three-dots.min.css'
  import 'toastify-js/src/toastify.css'

  export let analytics: Analytics
  export let auth: Auth
  export let db: Firestore

  export let user: User
  export let initialUserData: UserData

  const context = DEFAULT_CONTEXT

  let { targetLanguageCode } = initialUserData

  $: setUserData(db, user, { targetLanguageCode })

  interface TranslateTextParams {
    readonly targetLanguageCode: string
    readonly text: string
  }

  const translateText = async (
    { translateTextEndpoint }: AppContext,
    user: User,
    { targetLanguageCode, text }: TranslateTextParams
  ): Promise<TranslateTextResult> => {
    const idToken = user.getIdToken()
    const query = new URLSearchParams({ targetLanguageCode, text })
    const response = await fetch(`${translateTextEndpoint}?${query}`, {
      headers: {
        authorization: `Bearer ${idToken}`,
      },
    })
    if (!response.ok) {
      const text = await response.text()
      console.error(text)
      throw new Error('Invalid response')
    }
    const json = await response.json()
    return json
  }

  interface SendTextFromBotToChatParams {
    readonly text: string
  }

  const sendTextFromBotToChat = async (
    { sendTextFromBotToChatEndpoint }: AppContext,
    db: Firestore,
    user: User,
    { text }: SendTextFromBotToChatParams
  ) => {
    const userData = await getUserData(db, user)
    if (typeof userData.targetLanguageCode === 'undefined') {
      console.error(userData)
      throw new Error('targetLanguageCode missing')
    }
    targetLanguageCode = userData.targetLanguageCode

    const idToken = user.getIdToken()
    const query = new URLSearchParams({ text })
    const response = await fetch(`${sendTextFromBotToChatEndpoint}?${query}`, {
      headers: {
        authorization: `Bearer ${idToken}`,
      },
    })
    if (!response.ok) {
      const text = await response.text()
      console.error(text)
      throw new Error('Invalid response')
    }
  }

  const translateChat = async (text: string) => {
    const { detectedLanguageCode, translatedText } = await translateText(context, user, {
      targetLanguageCode,
      text,
    })
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
</script>

<main>
  <Connect {context} {db} {user} />
  <GenerateUrl {db} {user} />
  <Logout {auth} />
</main>
