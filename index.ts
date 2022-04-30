import type { HttpFunction } from '@google-cloud/functions-framework'
import { TranslationServiceClient } from '@google-cloud/translate'
import { http } from '@google-cloud/functions-framework'

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
