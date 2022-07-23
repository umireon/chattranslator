import { type Request, type Response } from "@google-cloud/functions-framework";

import { type Auth } from "firebase-admin/auth";
import { type Firestore } from "firebase-admin/firestore";
import { authenticateWithToken } from "./index";

test('authenticateWithToken creates a custom token', async () => {
  const customToken = "customToken"
  const token = 'token'
  const uid = 'uid'

  const req = {
    get(name: string) {
      if (name.toLowerCase() === "origin") {
        return "http://localhost:5171";
      } else {
        return "";
      }
    },
    query: {
      token,
      uid,
    },
  } as unknown as Request;

  const send = jest.fn()
  const res = {
    send,
    set(_1: string, _2: string) {},
  } as unknown as Response;

  const createCustomToken = jest.fn().mockResolvedValue(customToken)
  const auth = { createCustomToken } as unknown as Auth;

  const data = () => ({ token })
  const get = () => ({ data })
  const doc = jest.fn().mockReturnValue({ get })
  const collection = jest.fn().mockReturnValue({ doc })
  const db = { collection } as unknown as Firestore;

  await authenticateWithToken(req, res, auth, db)
  expect(collection.mock.calls[0][0]).toBe("users")
  expect(doc.mock.calls[0][0]).toBe(uid)
  expect(createCustomToken.mock.calls[0][0]).toBe(uid)
  expect(send.mock.calls[0][0]).toBe(customToken)
});

test('authenticateWithToken rejects an invalid token', async () => {
  const customToken = "customToken"
  const token = 'token'
  const invalidToken = 'invalidToken'
  const uid = 'uid'

  const req = {
    get(name: string) {
      if (name.toLowerCase() === "origin") {
        return "http://localhost:5171";
      } else {
        return "";
      }
    },
    query: {
      token: invalidToken,
      uid,
    },
  } as unknown as Request;

  const send = jest.fn()
  const status = jest.fn().mockReturnValue({ send })
  const res = {
    set(_1: string, _2: string) {},
    status,
  } as unknown as Response;

  const createCustomToken = jest.fn().mockResolvedValue(customToken)
  const auth = { createCustomToken } as unknown as Auth;

  const data = () => ({ token })
  const get = () => ({ data })
  const doc = jest.fn().mockReturnValue({ get })
  const collection = jest.fn().mockReturnValue({ doc })
  const db = { collection } as unknown as Firestore;

  await authenticateWithToken(req, res, auth, db)
  expect(collection.mock.calls[0][0]).toBe("users")
  expect(doc.mock.calls[0][0]).toBe(uid)
  expect(createCustomToken.mock.calls.length).toBe(0)
  expect(status.mock.calls[0][0]).toBe(401)
  expect(send.mock.calls[0][0]).toEqual({})
});
