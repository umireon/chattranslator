import { type Request, type Response } from "@google-cloud/functions-framework";
import { authenticateWithToken, setTwitchLoginToUser } from "./handlers.js";

import { type App } from "firebase-admin/app";
import { type Auth } from "firebase-admin/auth";
import { type Firestore } from "firebase-admin/firestore";
import crypto from 'crypto'

const app = {} as App;

const corsGet = (name: string) => {
  if (name.toLowerCase() === "origin") {
    return "http://localhost:5171";
  } else {
    return "";
  }
};

const corsSet = (_1: string, _2: string) => {};

test("setTwitchLoginToUser sets Twitch login to Firestore", async () => {
  const login = "login";
  const token = crypto.randomUUID();
  const uid = "uid";
  const idToken = Buffer.from(
    JSON.stringify({
      sub: uid,
    })
  ).toString("base64");

  const req = {
    get(name: string) {
      if (name === "X-Apigateway-Api-Userinfo") {
        return idToken;
      } else {
        return corsGet(name);
      }
    },
    query: {
      token,
      uid,
    },
  } as unknown as Request;

  const send = jest.fn();
  const status = jest.fn().mockReturnValue({ send });
  const res = {
    set: corsSet,
    status,
  } as unknown as Response;

  const _fetch = jest.fn().mockReturnValue({
    async json() {
      return {
        data: [{ login }],
      };
    },
    ok: true,
  });

  const set = jest.fn();
  const doc = jest.fn().mockReturnValue({ set });
  const collection = jest.fn().mockReturnValue({ doc });
  const db = { collection } as unknown as Firestore;

  await setTwitchLoginToUser(app, req, res, _fetch, db);
  expect(_fetch.mock.calls.length).toBe(1);
  expect(collection.mock.calls[0][0]).toBe("userTwitchLogin");
  expect(doc.mock.calls[0][0]).toBe(uid);
  expect(set.mock.calls[0][0]).toEqual({ login });
  expect(status.mock.calls[0][0]).toBe(204);
  expect(send.mock.calls[0][0]).toBe("");
});

test("authenticateWithToken creates a custom token", async () => {
  const customToken = "customToken";
  const token = crypto.randomUUID()
  const uid = "uid";

  const req = {
    get: corsGet,
    query: {
      token,
      uid,
    },
  } as unknown as Request;

  const send = jest.fn();
  const res = {
    send,
    set: corsSet,
  } as unknown as Response;

  const createCustomToken = jest.fn().mockResolvedValue(customToken);
  const auth = { createCustomToken } as unknown as Auth;

  const data = () => ({ token });
  const get = () => ({ data });
  const doc = jest.fn().mockReturnValue({ get });
  const collection = jest.fn().mockReturnValue({ doc });
  const db = { collection } as unknown as Firestore;

  await authenticateWithToken(app, req, res, auth, db);
  expect(collection.mock.calls[0][0]).toBe("users");
  expect(doc.mock.calls[0][0]).toBe(uid);
  expect(createCustomToken.mock.calls[0][0]).toBe(uid);
  expect(send.mock.calls[0][0]).toBe(customToken);
});

test("authenticateWithToken rejects an invalid token", async () => {
  const customToken = "customToken";
  const token = crypto.randomUUID();
  const invalidToken = "invalidToken";
  const uid = "uid";

  const req = {
    get: corsGet,
    query: {
      token: invalidToken,
      uid,
    },
  } as unknown as Request;

  const send = jest.fn();
  const status = jest.fn().mockReturnValue({ send });
  const res = {
    set: corsSet,
    status,
  } as unknown as Response;

  const createCustomToken = jest.fn().mockResolvedValue(customToken);
  const auth = { createCustomToken } as unknown as Auth;

  const data = () => ({ token });
  const get = () => ({ data });
  const doc = jest.fn().mockReturnValue({ get });
  const collection = jest.fn().mockReturnValue({ doc });
  const db = { collection } as unknown as Firestore;

  await authenticateWithToken(app, req, res, auth, db);
  expect(collection.mock.calls[0][0]).toBe("users");
  expect(doc.mock.calls[0][0]).toBe(uid);
  expect(createCustomToken.mock.calls.length).toBe(0);
  expect(status.mock.calls[0][0]).toBe(401);
  expect(send.mock.calls[0][0]).toEqual({});
});
