import * as irc from 'irc'

import {
  getTwitchClientSecret,
  getTwitchLogin,
  getUidFromBase64,
  handleCors,
  obtainTwitchAccessToken,
  translateText,
} from './service.js'

import { DEFAULT_CONTEXT } from './constants.js'
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'
import { TranslationServiceClient } from '@google-cloud/translate'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { http } from '@google-cloud/functions-framework'
import { initializeApp } from 'firebase-admin/app'

const app = initializeApp()
const context = DEFAULT_CONTEXT

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
  const response = await translateText(translationClient, {
    projectId: PROJECT_ID,
    targetLanguageCode: 'en',
    text,
  })

  // Compose response
  res.send(response)
})

http('send-text-from-bot-to-chat', async (req, res) => {
  if (!handleCors(req, res)) return

  const db = getFirestore(app)

  // Validate environment
  const { PROJECT_ID } = process.env
  if (typeof PROJECT_ID === 'undefined') {
    throw new Error('PROJECT_ID not provided')
  }

  const secretManagerClient = new SecretManagerServiceClient()
  const clientSecret = await getTwitchClientSecret(secretManagerClient, {
    projectId: PROJECT_ID,
  })

  const password = await obtainTwitchAccessToken(context, db, clientSecret)

  // Validate query
  const idTokenBase64 = req.get('X-Apigateway-Api-Userinfo')
  if (typeof idTokenBase64 === 'undefined') {
    console.error('X-Apigateway-Api-Userinfo missing')
    res.status(401).send('Unauthorized')
    return
  }
  const uid = getUidFromBase64(idTokenBase64)
  if (typeof req.query.text !== 'string') {
    console.error(req.query)
    res.status(400).send('Invalid text')
    return
  }
  const { text } = req.query

  const docRef = await db.collection('userTwitchLogin').doc(uid).get()
  const data = docRef.data()
  if (typeof data?.login !== 'string') {
    console.error(data)
    throw new Error('Invalid userTwitchLogin')
  }
  const { login } = data

  const client = new irc.Client('irc.chat.twitch.tv', login, {
    channels: [`#${login}`],
    password,
    port: 6697,
  })
  client.addListener('message', function (from, to, message) {
    console.log(from + ' => ' + to + ': ' + message);
  })
  client.addListener('error', function(message) {
    console.log('error: ', message);
  })
  client.say(`#${login}`, text)

  res.status(204).send('')
})

http('set-twitch-login-to-user', async (req, res) => {
  if (!handleCors(req, res)) return

  const db = getFirestore(app)

  // Validate query
  const idTokenBase64 = req.get('X-Apigateway-Api-Userinfo')
  if (typeof idTokenBase64 === 'undefined') {
    res.status(401).send('Unauthorized')
    return
  }
  const uid = getUidFromBase64(idTokenBase64)
  if (typeof req.query.token !== 'string') {
    res.status(400).send('Invalid token')
    return
  }
  const { token } = req.query

  const login = await getTwitchLogin(context, token)

  await db.collection('userTwitchLogin').doc(uid).set({ login })

  res.status(204).send('')
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
