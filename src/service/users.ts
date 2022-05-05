import type {
  CollectionReference,
  Firestore,
  FirestoreDataConverter,
} from 'firebase/firestore'
import { collection, doc, getDoc, setDoc } from 'firebase/firestore'

import type { User } from 'firebase/auth'

export interface UserData {
  readonly nonce?: string
  readonly targetLanguageCode?: string
  readonly token?: string | null
  readonly 'twitch-access-token'?: string
}

export const extractUserData = (data: any): UserData => {
  let result: UserData = {}
  if (typeof data.nonce !== 'undefined') {
    result = { ...result, nonce: data.nonce }
  }
  if (typeof data.targetLanguageCode !== 'undefined') {
    result = { ...result, targetLanguageCode: data.targetLanguageCode }
  }
  if (typeof data.token !== 'undefined') {
    result = { ...result, token: data.token }
  }
  if (typeof data['twitch-access-token'] !== 'undefined') {
    result = { ...result, 'twitch-access-token': data['twitch-access-token'] }
  }
  return result
}

export const userConverter: FirestoreDataConverter<UserData> = {
  fromFirestore: (snapshot) => {
    const data = snapshot.data()
    return extractUserData(data)
  },
  toFirestore: extractUserData,
}

export const getUsersCollection = (
  db: Firestore
): CollectionReference<UserData> =>
  collection(db, 'users').withConverter(userConverter)

export const getUserData = async (
  db: Firestore,
  user: User
): Promise<UserData> => {
  const docRef = await getDoc(doc(getUsersCollection(db), user.uid))
  return docRef.data() || {}
}

export const setUserData = async (
  db: Firestore,
  user: User,
  data: UserData
) => {
  await setDoc(doc(getUsersCollection(db), user.uid), data, { merge: true })
}
