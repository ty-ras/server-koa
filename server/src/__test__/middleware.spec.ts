import test, { ExecutionContext } from "ava";

import * as spec from "../middleware";
import * as server from "./server";

import * as http from "http";
import Koa from "koa";

test("Validate Koa middleware works for happy path", async (t) => {
  await testKoaServer(t);
});

test("Validate Koa middleware works for 404", async (t) => {
  await testKoaServer(t, {
    regExp: /ungrouped-regexp-will-never-match/,
    expectedStatusCode: 404,
  });
});

test("Validate Koa middleware works for 204", async (t) => {
  await testKoaServer(t, 204);
});
test("Validate Koa middleware works for 403", async (t) => {
  await testKoaServer(t, 403);
});

const testKoaServer = (
  t: ExecutionContext,
  errorInfoOrOverrideResponseContent?:
    | {
        regExp: RegExp;
        expectedStatusCode: number;
      }
    | 204
    | 403,
) =>
  server.testServer(
    t,
    (endpoints) =>
      http.createServer(
        new Koa().use(spec.createMiddleware(endpoints)).callback(),
      ),
    errorInfoOrOverrideResponseContent,
  );
