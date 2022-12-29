import { type UserData, extractUserData } from "./users";

test("extractUserData extracts everything from a valid UserData", () => {
  const userData: UserData = {
    nonce: "",
    targetLanguageCode: "",
    token: "",
    "twitch-access-token": "",
  };
  expect(extractUserData(userData)).toEqual(userData);
});

test("extractUserData removes invalid keys", () => {
  const userData = {
    invalid: "",
  };
  expect(extractUserData(userData)).toEqual({});
});
