import type { AppContext } from '../../constants'
import type { User } from 'firebase/auth'
import { sendTextFromBotToChat } from './bot'

test('sendTextFromBotToChat resolves if request succeeds', async () => {
  const context = {
    sendTextFromBotToChatEndpoint: 'endpoint',
  } as AppContext
  const user = {
    async getIdToken() {
      return 'idToken'
    },
  } as User
  const text = 'text'
  const fetch = jest.fn().mockImplementation((input, init) => {
    expect(input).toBe('endpoint?text=text')
    expect(init).toEqual({ headers: { authorization: `Bearer idToken` } })
    return { ok: true }
  })
  await sendTextFromBotToChat(context, user, { text }, fetch)
})

// test('sendTextFromBotToChat rejects if request fails', async () => {
//   const context = {
//     sendTextFromBotToChatEndpoint: 'endpoint',
//   } as AppContext
//   const user = {
//     async getIdToken() {
//       return 'idToken'
//     }
//   } as User
//   const text = 'text'
//   const fetch = jest.fn().mockImplementation((input, init) => {
//     expect(input).toBe('endpoint?text=text')
//     expect(init).toEqual({ headers: { authorization: `Bearer idToken`}})
//     return {
//       ok: false,
//       async text() {
//         return ''
//       }
//     }
//   })
//   expect(() => sendTextFromBotToChat(context, user, { text }, fetch)).toThrow()
// })
