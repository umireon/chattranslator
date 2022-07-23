import type { AppContext } from "../../common/constants";
import type { User } from "firebase/auth";
import crypto from 'crypto'
import { sendTextFromBotToChat } from "./bot";

test("sendTextFromBotToChat resolves if request succeeds", async () => {
  const context = {
    sendTextFromBotToChatEndpoint: "endpoint",
  } as AppContext;
  const idToken = crypto.randomUUID();
  const user = {
    async getIdToken() {
      return idToken;
    },
  } as User;
  const text = "text";
  const _fetch = jest.fn().mockResolvedValue({ ok: true });
  await sendTextFromBotToChat(context, user, { text }, _fetch);
  expect(_fetch.mock.calls[0][0]).toBe("endpoint?text=text");
  expect(_fetch.mock.calls[0][1]).toEqual({
    headers: { authorization: `Bearer ${idToken}` },
  });
});
