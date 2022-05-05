import { AppContext } from '../../constants'
import { User } from 'firebase/auth'

interface SendTextFromBotToChatParams {
  readonly text: string
}

export const sendTextFromBotToChat = async (
  { sendTextFromBotToChatEndpoint }: AppContext,
  user: User,
  { text }: SendTextFromBotToChatParams
): Promise<void> => {
  const idToken = await user.getIdToken()
  const query = new URLSearchParams({ text })
  const response = await fetch(`${sendTextFromBotToChatEndpoint}?${query}`, {
    headers: {
      authorization: `Bearer ${idToken}`,
    },
  })
  if (!response.ok) {
    const text = await response.text()
    console.error(text)
    throw new Error('Invalid response')
  }
}
