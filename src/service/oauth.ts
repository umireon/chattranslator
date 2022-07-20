import { getUserData, setUserData } from "./users";

import type { Firestore } from "firebase/firestore";
import type { User } from "firebase/auth";

export const getTwitchToken = async (db: Firestore, user: User) => {
  const data = await getUserData(db, user);
  return data["twitch-access-token"];
};

export const setTwitchToken = async (
  db: Firestore,
  user: User,
  token: string
) => {
  await setUserData(db, user, { "twitch-access-token": token });
};

export const generateNonce = (_crypto = crypto): string => {
  const array = new Uint32Array(1);
  const generated = _crypto.getRandomValues(array);
  const nonce = generated[0].toString(16).padStart(8, "0");
  return nonce;
};
