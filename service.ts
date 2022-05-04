import {
  Firestore,
  FirestoreDataConverter,
  Timestamp,
} from 'firebase-admin/firestore'
import type { TranslateTextOption, TranslateTextResult } from './types.js'

import type { AppContext } from './constants.js'
import { HttpFunction } from '@google-cloud/functions-framework'
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'
import { TranslationServiceClient } from '@google-cloud/translate'
import fetch from 'node-fetch'

export const handleCors: HttpFunction = (req, res) => {
  const { origin } = req.headers
  if (typeof origin !== 'undefined') {
    const { hostname } = new URL(origin)
    if (hostname === 'localhost') {
      res.set('Access-Control-Allow-Origin', '*')
    } else {
      res.set('Access-Control-Allow-Origin', 'https://chattalker.web.app')
    }
  }

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET')
    res.set('Access-Control-Allow-Headers', 'Authorization')
    res.set('Access-Control-Max-Age', '3600')
    res.status(204).send('')
    return false
  }

  return true
}

export const translateText = async (
  client: TranslationServiceClient,
  { glossaryConfig, projectId, targetLanguageCode, text }: TranslateTextOption
): Promise<TranslateTextResult> => {
  const [response] = await client.translateText({
    contents: [text],
    glossaryConfig,
    parent: `projects/${projectId}/locations/global`,
    targetLanguageCode,
  })
  if (typeof response === 'undefined') {
    console.error(JSON.stringify(response))
    throw new Error('Invalid response')
  }

  const translations =
    typeof glossaryConfig === 'undefined'
      ? response.translations
      : response.glossaryTranslations
  if (!Array.isArray(translations) || typeof translations[0] === 'undefined') {
    console.error(JSON.stringify(response))
    throw new Error('Invalid response')
  }

  const { detectedLanguageCode, translatedText } = translations[0]
  if (!detectedLanguageCode || !translatedText) {
    console.error(JSON.stringify(response))
    throw new Error('Invalid response')
  }

  return {
    ...translations[0],
    detectedLanguageCode,
    translatedText,
  }
}

export interface TwitchUsersData {
  readonly login: string
}

export interface TwitchUsersResponse {
  readonly data: TwitchUsersData[]
}

export const validateTwitchUsersResponse = (
  arg: any
): arg is TwitchUsersResponse => {
  if (typeof arg === 'undefined' || arg === null) return false
  return Array.isArray(arg.data)
}

export const getTwitchLogin = async (
  { twitchClientId }: AppContext,
  token: string
): Promise<string> => {
  const response = await fetch('https://api.twitch.tv/helix/users', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Client-Id': twitchClientId,
    },
  })
  if (!response.ok) throw new Error('Twitch login could not be retrieved!')
  const json: unknown = await response.json()
  if (!validateTwitchUsersResponse(json)) throw new Error('Invalid response')
  const {
    data: [{ login }],
  } = json
  return login
}

export const getUidFromBase64 = (idTokenBase64: string): string => {
  const idToken = Buffer.from(idTokenBase64, 'base64').toString()
  const decodedToken = JSON.parse(idToken)
  if (typeof decodedToken.sub !== 'string') {
    console.error(idToken)
    throw new Error('Invalid idToken')
  }
  return decodedToken.sub
}

export interface TwitchAccessTokenData {
  readonly token?: string
  readonly expiresAt?: Timestamp
}

export const extractTwitchAccessTokenData = (
  data: any
): TwitchAccessTokenData => {
  let result: TwitchAccessTokenData = {}
  if (typeof data.expiresAt !== 'undefined') {
    result = { ...result, expiresAt: data.expiresAt }
  }
  if (typeof data.token !== 'undefined') {
    result = { ...result, token: data.token }
  }
  return result
}

export const twitchAccessTokenConverter: FirestoreDataConverter<TwitchAccessTokenData> =
  {
    fromFirestore: (snapshot) => {
      const data = snapshot.data()
      return extractTwitchAccessTokenData(data)
    },
    toFirestore: extractTwitchAccessTokenData,
  }

export interface OauthAccessToken {
  /* eslint-disable camelcase */
  readonly access_token: string
  readonly expires_in: number
  /* eslint-enable camelcase */
}

export const isOauthAccessToken = (arg: any): arg is OauthAccessToken => {
  return (
    typeof arg.access_token === 'string' && typeof arg.expires_in === 'number'
  )
}

export interface GetOrRefreshTwitchAccessTokenParams {
  readonly clientId: string
  readonly clientSecret: string
}

export const OAUTH_EXPIRE_WINDOW_SECONDS = 60

export const getOrRefreshTwitchAccessToken = async (
  { clientId, clientSecret }: GetOrRefreshTwitchAccessTokenParams,
  twitchAccessTokenData: TwitchAccessTokenData | undefined
): Promise<Required<TwitchAccessTokenData>> => {
  const expiresAt = twitchAccessTokenData?.expiresAt
  const token = twitchAccessTokenData?.token
  const now = Timestamp.now().toDate()
  if (
    typeof expiresAt === 'undefined' ||
    typeof token === 'undefined' ||
    now > expiresAt.toDate()
  ) {
    const body = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    })
    const response = await fetch('https://id.twitch.tv/oauth2/token', { body })
    if (!response.ok) {
      const text = await response.text()
      console.error(text)
      throw new Error('Invalid response')
    }

    const json = await response.json()
    if (!isOauthAccessToken(json)) {
      const text = await response.text()
      console.error(text)
      throw new Error('Invalid response')
    }

    const newTwitchAccessTokenData = {
      expiresAt: Timestamp.fromDate(
        new Date(
          now.getTime() + (json.expires_in - OAUTH_EXPIRE_WINDOW_SECONDS) * 1000
        )
      ),
      token: json.access_token,
    }
    return newTwitchAccessTokenData
  } else {
    return { expiresAt, token }
  }
}

export const obtainTwitchAccessToken = async (
  { twitchClientId }: AppContext,
  db: Firestore,
  clientSecret: string
): Promise<string> => {
  const docRef = db
    .collection('twitchAccessToken')
    .withConverter(twitchAccessTokenConverter)
    .doc('server')
  const docSnapshot = await docRef.get()
  const data = docSnapshot.data()
  const newData = await getOrRefreshTwitchAccessToken(
    { clientId: twitchClientId, clientSecret },
    data
  )
  await docRef.set(newData)
  return newData.token
}

export interface GetTwitchClientSecretOption {
  readonly name?: string
  readonly projectId: string
  readonly version?: string
}

export const DEFAULT_TWITCH_CLIENT_SECRET_VERSION = '1'

export const coarseIntoString = (data: Uint8Array | string): string => {
  if (typeof data === 'string') {
    return data
  } else {
    const decoder = new TextDecoder()
    return decoder.decode(data)
  }
}

export const getTwitchClientSecret = async (
  client: SecretManagerServiceClient,
  {
    name = 'twitch-client-secret',
    projectId,
    version = DEFAULT_TWITCH_CLIENT_SECRET_VERSION,
  }: GetTwitchClientSecretOption
) => {
  const [response] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${name}/versions/${version}`,
  })
  if (!response.payload || !response.payload.data)
    throw new Error('Invalid response')
  return coarseIntoString(response.payload.data)
}
