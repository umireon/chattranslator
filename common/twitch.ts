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
  return Array.isArray(arg?.data) && typeof arg.data[0]?.login === 'string'
}

export const TWITCH_USERS_ENDPOINT = 'https://api.twitch.tv/helix/users'

export const getTwitchLogin = async (
  { twitchClientId }: AppContext,
  token: string,
  _fetch = fetch
): Promise<string> => {
  const response = await _fetch(TWITCH_USERS_ENDPOINT, {
    headers: {
      authorization: `Bearer ${token}`,
      'client-id': twitchClientId,
    },
  })
  if (!response.ok) throw new Error('Twitch login could not be retrieved!')
  const json = await response.json()
  if (!validateTwitchUsersResponse(json)) throw new Error('Invalid response')
  const {
    data: [{ login }],
  } = json
  return login
}
