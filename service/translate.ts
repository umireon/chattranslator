import type { TranslateTextOption, TranslateTextResult } from '../common/translate'
import { TranslationServiceClient } from '@google-cloud/translate'

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
