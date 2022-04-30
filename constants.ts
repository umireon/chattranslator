export interface AppContext {
  readonly translateTextEndpoint: string;
}

export const DEFAULT_CONTEXT: AppContext = {
  translateTextEndpoint: "a",
} as const;

export const firebaseConfig = {
  apiKey: "AIzaSyBhOCCQhHwwR7LBJOOstvdYBdY2PTWa4NA",
  authDomain: "chattranslatorbot.firebaseapp.com",
  projectId: "chattranslatorbot",
  storageBucket: "chattranslatorbot.appspot.com",
  messagingSenderId: "1034253470102",
  appId: "1:1034253470102:web:a4567a1b21cc44edafb5b7",
  measurementId: "G-Q8LDQFFZJS",
} as const;
