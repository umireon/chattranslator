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

export interface GetTwitchOAuthTokenOption {
  readonly name?: string
  readonly projectId: string
  readonly version?: string
}

export const DEFAULT_TWITCH_OAUTH_TOKEN_VERSION = '1'

export const coarseIntoString = (data: Uint8Array | string): string => {
  if (typeof data === 'string') {
    return data
  } else {
    const decoder = new TextDecoder()
    return decoder.decode(data)
  }
}

export const getTwitchOauthToken = async (
  client: SecretManagerServiceClient,
  {
    name = 'twitch-oauth-token',
    projectId,
    version = DEFAULT_TWITCH_OAUTH_TOKEN_VERSION,
  }: GetTwitchOAuthTokenOption
) => {
  const [response] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${name}/versions/${version}`,
  })
  if (!response.payload || !response.payload.data) {
    throw new Error('Invalid response')
  }
  const data = coarseIntoString(response.payload.data)
  return data
}