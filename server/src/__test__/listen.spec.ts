/**
 * @file This file contains unit tests for functionality in file `../server-node.ts`.
 */

import test from "ava";
import * as spec from "../listen";
import Koa from "koa";
import getPort from "@ava/get-port";

test("Verify that listen overload for host and port works", async (c) => {
  c.plan(1);
  await c.notThrowsAsync(
    async () => await spec.listenAsync(new Koa(), "localhost", await getPort()),
  );
});

test("Verify that listen overload for listen options works", async (c) => {
  c.plan(1);
  await c.notThrowsAsync(
    async () =>
      await spec.listenAsync(new Koa(), {
        options: {},
        listen: { host: "localhost", port: await getPort() },
      }),
  );
});
