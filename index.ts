import { DEFAULT_CONTEXT } from "./common/constants.js";
import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { Client as TmiClient } from "tmi.js";
import { TranslationServiceClient } from "@google-cloud/translate";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getTwitchLogin } from "./common/twitch.js";
import { getTwitchOauthToken } from "./service/secret.js";
import { getUidFromBase64 } from "./service/apigateway.js";
import { handleCors } from "./service/cors.js";
import { http } from "@google-cloud/functions-framework";
import { initializeApp } from "firebase-admin/app";
import nodeFetch from "node-fetch";
import { translateText } from "./service/translate.js";

const app = initializeApp();
const context = DEFAULT_CONTEXT;
const _fetch = nodeFetch as typeof fetch;

http("translate-text", async (req, res) => {
  if (!handleCors(req, res)) return;

  // Keep Alive
  if (req.query.keepAlive === "true") {
    res.status(204).send("");
    return;
  }

  // Validate environment
  const { PROJECT_ID } = process.env;
  if (typeof PROJECT_ID === "undefined")
    throw new Error("PROJECT_ID not provided");

  // Validate query
  if (typeof req.query.targetLanguageCode !== "string") {
    res.status(400).send("Invalid text");
    return;
  }
  if (typeof req.query.text !== "string") {
    res.status(400).send("Invalid text");
    return;
  }
  const { targetLanguageCode, text } = req.query;

  // Translate text
  const translationClient = new TranslationServiceClient();
  const response = await translateText(translationClient, {
    projectId: PROJECT_ID,
    targetLanguageCode,
    text,
  });

  // Compose response
  res.send(response);
});

http("send-text-from-bot-to-chat", async (req, res) => {
  if (!handleCors(req, res)) return;

  // Keep Alive
  if (req.query.keepAlive === "true") {
    res.status(204).send("");
    return;
  }

  const db = getFirestore(app);

  // Validate environment
  const { PROJECT_ID } = process.env;
  if (typeof PROJECT_ID === "undefined") {
    throw new Error("PROJECT_ID not provided");
  }

  const secretManagerClient = new SecretManagerServiceClient();
  const token = await getTwitchOauthToken(secretManagerClient, {
    projectId: PROJECT_ID,
  });

  // Validate query
  const idTokenBase64 = req.get("X-Apigateway-Api-Userinfo");
  if (typeof idTokenBase64 === "undefined") {
    console.error("X-Apigateway-Api-Userinfo missing");
    res.status(401).send("Unauthorized");
    return;
  }
  const uid = getUidFromBase64(idTokenBase64);
  if (typeof req.query.text !== "string") {
    console.error(req.query);
    res.status(400).send("Invalid text");
    return;
  }
  const { text } = req.query;

  const docRef = await db.collection("userTwitchLogin").doc(uid).get();
  const data = docRef.data();
  if (typeof data?.login !== "string") {
    console.error(data);
    throw new Error("Invalid userTwitchLogin");
  }
  const { login } = data;

  const client = new TmiClient({
    connection: {
      reconnect: true,
      secure: true,
    },
    identity: {
      password: `oauth:${token}`,
      username: context.botUsername,
    },
    options: {
      debug: true,
      messagesLogLevel: "info",
    },
  });

  await client.connect();
  await client.say(login, text);

  res.status(204).send("");
});

http("set-twitch-login-to-user", async (req, res) => {
  if (!handleCors(req, res)) return;

  const db = getFirestore(app);

  // Validate query
  const idTokenBase64 = req.get("X-Apigateway-Api-Userinfo");
  if (typeof idTokenBase64 === "undefined") {
    res.status(401).send("Unauthorized");
    return;
  }
  const uid = getUidFromBase64(idTokenBase64);
  if (typeof req.query.token !== "string") {
    res.status(400).send("Invalid token");
    return;
  }
  const { token } = req.query;

  const login = await getTwitchLogin(context, token, _fetch);

  await db.collection("userTwitchLogin").doc(uid).set({ login });

  res.status(204).send("");
});

http("authenticate-with-token", async (req, res) => {
  if (!handleCors(req, res)) return;

  const auth = getAuth(app);
  const db = getFirestore(app);

  // Validate query
  if (typeof req.query.token !== "string") {
    res.status(400).send("Invalid token");
    return;
  }
  if (typeof req.query.uid !== "string") {
    res.status(400).send("Invalid uid");
    return;
  }
  const { token, uid } = req.query;

  // Verify token
  const docRef = await db.collection("users").doc(uid).get();
  const data = docRef.data();
  if (!data) throw new Error("Record could not be fetched");
  const expectedToken = data.token;
  if (!expectedToken) throw new Error("token not found");
  if (token !== expectedToken) {
    res.status(401).send({});
    return;
  }

  // Generate custom token
  const customToken = await auth.createCustomToken(uid);
  res.send(customToken);
});
