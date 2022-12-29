import { type AppContext } from "../../common/constants";
import { type User } from "firebase/auth";

interface SendTextFromBotToChatParams {
  readonly text: string;
}

export const sendTextFromBotToChat = async (
  {
    sendTextFromBotToChatEndpoint,
  }: Pick<AppContext, "sendTextFromBotToChatEndpoint">,
  user: User,
  { text }: SendTextFromBotToChatParams,
  _fetch = fetch
): Promise<void> => {
  const idToken = await user.getIdToken();
  const query = new URLSearchParams({ text });
  const response = await _fetch(`${sendTextFromBotToChatEndpoint}?${query}`, {
    headers: {
      authorization: `Bearer ${idToken}`,
    },
  });
  if (!response.ok) {
    const text = await response.text();
    console.error(text);
    throw new Error("Invalid response");
  }
};
