import { TranslationServiceClient } from '@google-cloud/translate'
import { translateText } from './translate'

test('translateText without glossaryConfig returns translation', async () => {
  const translation = {
    detectedLanguageCode: 'detectedLanguageCode',
    translatedText: 'translatedText',
  }
  const clientTranslateText = jest.fn().mockResolvedValue([
    {
      translations: [translation],
    },
  ])
  const client = {
    translateText: clientTranslateText,
  } as unknown as InstanceType<typeof TranslationServiceClient>
  const actual = await translateText(client, {
    projectId: 'projectId',
    targetLanguageCode: 'targetLanguageCode',
    text: 'text',
  })
  expect(actual).toEqual(translation)
})

test('translateText with glossaryConfig returns glossaryTranslation', async () => {
  const glossaryTranslation = {
    detectedLanguageCode: 'detectedLanguageCode',
    translatedText: 'translatedText',
  }
  const clientTranslateText = jest.fn().mockResolvedValue([
    {
      glossaryTranslations: [glossaryTranslation],
    },
  ])
  const client = {
    translateText: clientTranslateText,
  } as unknown as InstanceType<typeof TranslationServiceClient>
  const actual = await translateText(client, {
    glossaryConfig: {},
    projectId: 'projectId',
    targetLanguageCode: 'targetLanguageCode',
    text: 'text',
  })
  expect(actual).toEqual(glossaryTranslation)
})
