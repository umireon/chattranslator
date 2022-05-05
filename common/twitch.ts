import type { AppContext } from './constants'

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
  token: string,
  _fetch = fetch
): Promise<string> => {
  const response = await _fetch('https://api.twitch.tv/helix/users', {
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
