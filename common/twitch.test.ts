import {
  TWITCH_USERS_ENDPOINT,
  getTwitchLogin,
  validateTwitchUsersResponse,
} from "./twitch";

import type { AppContext } from "./constants";

test("validateTwitchUsersResponse validates the response", async () => {
  const json = { data: [{ login: "" }] };
  expect(validateTwitchUsersResponse(json)).toBe(true);
});

test("getTwitchLogin returns login from the response", async () => {
  const twitchClientId = "clientId";
  const context = { twitchClientId } as AppContext;
  const token = Math.random().toString();
  const login = "login";
  const _fetch = jest.fn().mockImplementation((input, init) => {
    expect(input).toBe(TWITCH_USERS_ENDPOINT);
    expect(init).toEqual({
      headers: {
        authorization: `Bearer ${token}`,
        "client-id": twitchClientId,
      },
    });
    return {
      async json() {
        return {
          data: [{ login }],
        };
      },
      ok: true,
    };
  });
  const actual = await getTwitchLogin(context, token, _fetch);
  expect(actual).toBe(login);
});
