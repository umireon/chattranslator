import { AppContext } from '../../constants'
import { TranslateTextResult } from '../../types'
import { User } from 'firebase/auth'

export interface TranslateTextParams {
  readonly targetLanguageCode: string
  readonly text: string
}

export const translateText = async (
  { translateTextEndpoint }: AppContext,
  user: User,
  { targetLanguageCode, text }: TranslateTextParams,
  _fetch = fetch
): Promise<TranslateTextResult> => {
  const idToken = await user.getIdToken()
  const query = new URLSearchParams({ targetLanguageCode, text })
  const response = await _fetch(`${translateTextEndpoint}?${query}`, {
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
