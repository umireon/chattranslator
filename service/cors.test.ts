import { type Request, type Response } from "@google-cloud/functions-framework";

import { handleCors } from "./cors";

test("handleCors sends allowance for localhost", () => {
  const req = {
    get(name: string) {
      if (name.toLowerCase() === "origin") {
        return "http://localhost:3000";
      } else {
        return "";
      }
    },
  } as unknown as Request;
  const set = jest.fn();
  const res = { set } as unknown as Response;
  expect(handleCors(req, res)).toBe(true);
  expect(set.mock.calls.length).toBe(1);
  expect(set.mock.calls[0][0]).toBe("Access-Control-Allow-Origin");
  expect(set.mock.calls[0][1]).toBe("*");
});

test("handleCors sends allowance for chattranslatorbot.web.app", () => {
  const req = {
    get(name: string) {
      if (name.toLowerCase() === "origin") {
        return "https://chattranslatorbot.web.app";
      } else {
        return "";
      }
    },
  } as unknown as Request;
  const set = jest.fn();
  const res = { set } as unknown as Response;
  expect(handleCors(req, res)).toBe(true);
  expect(set.mock.calls.length).toBe(1);
  expect(set.mock.calls[0][0]).toBe("Access-Control-Allow-Origin");
  expect(set.mock.calls[0][1]).toBe("https://chattranslatorbot.web.app");
});

test("handleCors sends preflight response and terminates request", () => {
  const req = {
    get(name: string) {
      if (name.toLowerCase() === "origin") {
        return "https://chattranslatorbot.web.app";
      } else {
        return "";
      }
    },
    method: "OPTIONS",
  } as unknown as Request;
  const set = jest.fn();
  const send = jest.fn();
  const status = jest.fn().mockReturnValue({ send });
  const res = { set, status } as unknown as Response;
  expect(handleCors(req, res)).toBe(false);
  const headers = Object.fromEntries(set.mock.calls);
  expect(headers["Access-Control-Allow-Methods"]).toBe("GET");
  expect(headers["Access-Control-Allow-Headers"]).toBe("Authorization");
  expect(headers["Access-Control-Max-Age"]).toBe("3600");
  expect(status.mock.calls[0][0]).toBe(204);
  expect(send.mock.calls[0][0]).toBe("");
});
