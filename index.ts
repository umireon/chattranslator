import { FormData, formDataToBlob } from 'formdata-polyfill/esm.min.js'

import { Blob } from 'fetch-blob'
import type { HttpFunction } from '@google-cloud/functions-framework'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'
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

interface DetectLanguageOption {
  projectId: string
  content: string
}

const detectLanguage = async (client: TranslationServiceClient, { projectId, content }: DetectLanguageOption) => {
  const [response] = await client.detectLanguage({
    content,
    parent: `projects/${projectId}/locations/global`
  })
  const { languages } = response
  if (!languages) return 'und'
  const [{ languageCode }] = languages
  return languageCode || 'und'
}

http('text-to-speech', async (req, res) => {
  if (!handleCors(req, res)) return

  // Validate environment
  const { PROJECT_ID } = process.env
  if (typeof PROJECT_ID === 'undefined') throw new Error('PROJECT_ID not provided')

  // Validate query
  if (req.query.keepAlive === 'true') {
    res.status(204).send('')
    return
  }
  if (typeof req.query.text !== 'string') {
    res.status(400).send('Invalid text')
    return
  }
  if (!validateVoice(req.query.voice)) {
    res.status(400).send('Invalid voice')
    return
  }
  const { text, voice } = req.query

  // Detect language
  const translationClient = new TranslationServiceClient()
  const language = await detectLanguage(translationClient, { content: text, projectId: PROJECT_ID })

  // Synthesize speech
  const textToSpeechClient = new TextToSpeechClient()
  const [response] = await textToSpeechClient.synthesizeSpeech({
    audioConfig: { audioEncoding: 'MP3' },
    input: { text },
    voice: getVoice(voice, language)
  })
  const { audioContent } = response
  if (!audioContent) throw new Error('Invalid response')

  // Compose response
  const formData = new FormData()
  formData.append('audioContent', new Blob([coarseIntoUint8Array(audioContent)], {
    type: 'audio/mpeg'
  }))
  formData.append('language', language)
  const blob = formDataToBlob(formData)
  const arrayBuffer = await blob.arrayBuffer()
  res.set('Content-Type', blob.type)
  res.send(Buffer.from(arrayBuffer))
})
