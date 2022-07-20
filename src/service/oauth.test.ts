import { generateNonce, setTwitchToken } from "./oauth";

import type { Firestore } from "firebase/firestore";
import type { User } from "firebase/auth";
import { setUserData } from "./users";

jest.mock("./users");

const mockedSetUserData = setUserData as jest.Mock<Promise<void>>;

test("setTwitchToken sets twitch-access-token", async () => {
  const db = {} as Firestore;
  const user = {} as User;
  await setTwitchToken(db, user, "token");
  expect(mockedSetUserData.mock.calls[0][0]).toBe(db);
  expect(mockedSetUserData.mock.calls[0][1]).toBe(user);
  expect(mockedSetUserData.mock.calls[0][2]).toEqual({
    "twitch-access-token": "token",
  });
});

test("generateNonce returns crypto-based string", async () => {
  const _crypto = {
    getRandomValues(array: Uint32Array): Uint32Array {
      array[0] = 42;
      return array;
    },
  } as Crypto;
  expect(generateNonce(_crypto)).toBe("0000002a");
});
