import type { ChatUserstate } from "tmi.js";
import { Client as TmiClient } from "tmi.js";

export interface ConnectTwitchParams {
  login: string;
  token: string;
}

export type ConnectTwitchCallback = (text: string, tags: ChatUserstate) => void;

export const connectTwitch = async (
  params: ConnectTwitchParams,
  callback: ConnectTwitchCallback
) => {
  const { login, token } = params;
  const client = new TmiClient({
    channels: [login],
    connection: {
      reconnect: true,
      secure: true,
    },
    identity: {
      password: `oauth:${token}`,
      username: login,
    },
    options: {
      debug: true,
      messagesLogLevel: "info",
    },
  });
  await client.connect();
  client.on("message", (channel, tags, message, self) => {
    callback(message, tags);
  });
};
