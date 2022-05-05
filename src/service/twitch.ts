import type { AppContext } from '../../constants'
import { Client as TmiClient } from 'tmi.js'

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

export interface ConnectTwitchParams {
  login: string
  token: string
}

type ConnectTwitchCallback = (text: string) => void

export const connectTwitch = async (
  params: ConnectTwitchParams,
  callback: ConnectTwitchCallback
) => {
  const { login, token } = params
  const client = new TmiClient({
    channels: [login],
    connection: {
      reconnect: true,
      secure: true,
    },
    identity: {
      password: `oauth:${token}`,
      username: login,
    },
    options: {
      debug: true,
      messagesLogLevel: 'info',
    },
  })
  await client.connect()
  client.on('message', (channel, tags, message, self) => {
    callback(message)
  })
}
