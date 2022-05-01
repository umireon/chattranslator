import type { AppContext } from './constants.js'
import { DEFAULT_CONTEXT } from './constants.js'
import type { HttpFunction } from '@google-cloud/functions-framework'
import { TranslationServiceClient } from '@google-cloud/translate'
import fetch from 'node-fetch'
import { getAuth } from 'firebase-admin/auth'
import { http } from '@google-cloud/functions-framework'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const handleCors: HttpFunction = (req, res) => {
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

interface TranslateLanguageGlossaryConfig {
  glossary: string
  ignoreCase?: boolean
}

interface TranslateLanguageOption {
  text: string
  glossaryConfig?: TranslateLanguageGlossaryConfig
  projectId: string
  targetLanguageCode: string
}

const translateLanguage = async (
  client: TranslationServiceClient,
  {
    glossaryConfig,
    projectId,
    targetLanguageCode,
    text,
  }: TranslateLanguageOption
) => {
  const [response] = await client.translateText({
    contents: [text],
    glossaryConfig,
    parent: `projects/${projectId}/locations/global`,
    targetLanguageCode,
  })
  const [{ translatedText }] = response.translations
  return translatedText
}

const app = initializeApp()

http('translate-text', async (req, res) => {
  if (!handleCors(req, res)) return

  // Validate environment
  const { PROJECT_ID } = process.env
  if (typeof PROJECT_ID === 'undefined')
    throw new Error('PROJECT_ID not provided')

  // Validate query
  if (req.query.keepAlive === 'true') {
    res.status(204).send('')
    return
  }
  if (typeof req.query.text !== 'string') {
    res.status(400).send('Invalid text')
    return
  }
  const { text } = req.query

  // Translate text
  const translationClient = new TranslationServiceClient()
  const translatedText = await translateLanguage(translationClient, {
    projectId: PROJECT_ID,
    targetLanguageCode: 'en',
    text,
  })

  // Compose response
  res.send({ translatedText })
})

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

http('', async (req, res) => {
  if (!handleCors(req, res)) return

  // Validate query
  if (typeof req.query.token !== 'string') {
    res.status(400).send('Invalid token')
    return
  }
  if (typeof req.query.uid !== 'string') {
    res.status(400).send('Invalid uid')
    return
  }
  const { uid, token } = req.query
})

http('authenticate-with-token', async (req, res) => {
  if (!handleCors(req, res)) return

  const auth = getAuth(app)
  const db = getFirestore(app)

  // Validate query
  if (typeof req.query.token !== 'string') {
    res.status(400).send('Invalid token')
    return
  }
  if (typeof req.query.uid !== 'string') {
    res.status(400).send('Invalid uid')
    return
  }
  const { token, uid } = req.query

  // Verify token
  const docRef = await db.collection('users').doc(uid).get()
  const data = docRef.data()
  if (!data) throw new Error('Record could not be fetched')
  const expectedToken = data.token
  if (!expectedToken) throw new Error('token not found')
  if (token !== expectedToken) {
    res.status(401).send({})
    return
  }

  // Generate custom token
  const customToken = await auth.createCustomToken(uid)
  res.send(customToken)
})
