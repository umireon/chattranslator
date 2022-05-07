import * as util from 'util'

import {
  DEFAULT_TWITCH_OAUTH_TOKEN_VERSION,
  TWITCH_OAUTH_TOKEN_FIELD_NAME,
  coarseIntoString,
  getTwitchOauthToken,
} from './secret'
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'

const _TextDecoder = util.TextDecoder as typeof TextDecoder

test('coarseIntoString converts Uint8Array into string', () => {
  const array = new Uint8Array([65])
  const actual = coarseIntoString(array, _TextDecoder)
  expect(actual).toBe('A')
})

test('coarseIntoString does nothing with string', () => {
  const string = 'string'
  const actual = coarseIntoString(string, _TextDecoder)
  expect(actual).toBe(string)
})

test('getTwitchOauthToken accesses Secret Manager', async () => {
  const accessSecretVersion = jest
    .fn()
    .mockResolvedValue([{ payload: { data: 'data' } }])
  const client = {
    accessSecretVersion,
  } as unknown as InstanceType<typeof SecretManagerServiceClient>
  const actual = await getTwitchOauthToken(
    client,
    { projectId: 'projectId' },
    _TextDecoder
  )
  expect(actual).toBe('data')
  expect(accessSecretVersion.mock.calls[0][0]).toEqual({
    name: `projects/projectId/secrets/${TWITCH_OAUTH_TOKEN_FIELD_NAME}/versions/${DEFAULT_TWITCH_OAUTH_TOKEN_VERSION}`,
  })
})
