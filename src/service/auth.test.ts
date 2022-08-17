import {
  type Auth,
  type UserCredential,
  signInWithCustomToken,
} from "firebase/auth";

import { authenticateWithToken } from "./auth";

jest.mock("firebase/auth");

const mockedSignInWithCustomToken = signInWithCustomToken as jest.Mock<
  Promise<UserCredential>
>;

test("authenticateWithToken returns UserCredential", async () => {
  const context = { authenticateWithTokenEndpoint: "endpoint" };
  const auth = {} as Auth;
  const token = "token";
  const uid = "uid";
  const customToken = "customToken";
  const response = {
    ok: true,
    async text() {
      return customToken;
    },
  };
  const _fetch = jest.fn().mockResolvedValue(response);
  const credential = {} as UserCredential;
  mockedSignInWithCustomToken.mockResolvedValue(credential);
  const actual = await authenticateWithToken(
    context,
    auth,
    { token, uid },
    _fetch
  );
  expect(_fetch.mock.calls[0][0]).toBe("endpoint?token=token&uid=uid");
  expect(mockedSignInWithCustomToken.mock.calls[0][0]).toBe(auth);
  expect(mockedSignInWithCustomToken.mock.calls[0][1]).toBe(customToken);
  expect(actual).toBe(credential);
});
