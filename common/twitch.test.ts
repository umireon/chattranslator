import {
  TWITCH_USERS_ENDPOINT,
  getTwitchLogin,
  validateTwitchUsersResponse,
} from "./twitch";

import type { AppContext } from "./constants";
import crypto from "crypto";

test("validateTwitchUsersResponse validates the response", async () => {
  const json = { data: [{ login: "" }] };
  expect(validateTwitchUsersResponse(json)).toBe(true);
});

test("getTwitchLogin returns login from the response", async () => {
  const twitchClientId = "clientId";
  const context = { twitchClientId } as AppContext;
  const token = crypto.randomUUID();
  const login = "login";
  const _fetch = jest.fn().mockReturnValue({
    async json() {
      return {
        data: [{ login }],
      };
    },
    ok: true,
  });
  const actual = await getTwitchLogin(context, token, _fetch);
  expect(actual).toBe(login);
  expect(_fetch.mock.calls[0][0]).toBe(TWITCH_USERS_ENDPOINT);
  expect(_fetch.mock.calls[0][1]).toEqual({
    headers: {
      authorization: `Bearer ${token}`,
      "client-id": twitchClientId,
    },
  });
});
