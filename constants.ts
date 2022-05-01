export interface AppContext {
  readonly authenticateWithTokenEndpoint: string
  readonly textToSpeechEndpoint: string
  readonly translateTextEndpoint: string
  readonly twitchClientId: string
  readonly youtubeCallbackEndpoint: string
  readonly youtubeClientId: string
  readonly youtubeRefreshEndpoint: string
}

export const DEFAULT_CONTEXT: AppContext = {
  authenticateWithTokenEndpoint: '',
  textToSpeechEndpoint: '',
  translateTextEndpoint: 'https://chattranslatorbot-d74nt8ye.an.gateway.dev',
  twitchClientId: '',
  youtubeCallbackEndpoint: '',
  youtubeClientId: '',
  youtubeRefreshEndpoint: '',
} as const

export const firebaseConfig = {
  apiKey: 'AIzaSyBhOCCQhHwwR7LBJOOstvdYBdY2PTWa4NA',
  appId: '1:1034253470102:web:a4567a1b21cc44edafb5b7',
  authDomain: 'chattranslatorbot.firebaseapp.com',
  measurementId: 'G-Q8LDQFFZJS',
  messagingSenderId: '1034253470102',
  projectId: 'chattranslatorbot',
  storageBucket: 'chattranslatorbot.appspot.com',
} as const
