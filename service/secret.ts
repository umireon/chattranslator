import { SecretManagerServiceClient } from '@google-cloud/secret-manager'

export interface GetTwitchOAuthTokenOption {
  readonly name?: string
  readonly projectId: string
  readonly version?: string
}

export const DEFAULT_TWITCH_OAUTH_TOKEN_VERSION = '1'

export const coarseIntoString = (data: Uint8Array | string, _TextDecoder = TextDecoder): string => {
  if (typeof data === 'string') {
    return data
  } else {
    const decoder = new _TextDecoder()
    return decoder.decode(data)
  }
}

export const getTwitchOauthToken = async (
  client: SecretManagerServiceClient,
  {
    name = 'twitch-oauth-token',
    projectId,
    version = DEFAULT_TWITCH_OAUTH_TOKEN_VERSION,
  }: GetTwitchOAuthTokenOption,
  _TextDecoder = TextDecoder
) => {
  const [response] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${name}/versions/${version}`,
  })
  if (!response.payload || !response.payload.data) {
    throw new Error('Invalid response')
  }
  const data = coarseIntoString(response.payload.data, _TextDecoder)
  return data
}
