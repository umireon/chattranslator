import { type Request, type Response } from "@google-cloud/functions-framework";

import { type App } from "firebase-admin/app";
import { DEFAULT_CONTEXT } from "./common/constants.js";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getTwitchLogin } from "./common/twitch.js";
import { getUidFromBase64 } from "./service/apigateway.js";
import { handleCors } from "./service/cors.js";
import nodeFetch from "node-fetch";

const context = DEFAULT_CONTEXT;

export const setTwitchLoginToUser = async (
  app: App,
  req: Request,
  res: Response,
  _fetch = nodeFetch as typeof fetch,
  db = getFirestore(app)
) => {
  if (!handleCors(req, res)) return;

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
};

export const authenticateWithToken = async (
  app: App,
  req: Request,
  res: Response,
  auth = getAuth(app),
  db = getFirestore(app)
) => {
  if (!handleCors(req, res)) return;

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
};
