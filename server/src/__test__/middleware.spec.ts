import test from "ava";
import getPort from "@ava/get-port";

import * as spec from "../middleware";
import * as destroy from "./destroy";
import * as request from "./request";

import * as http from "http";
import type * as net from "net";
import Koa from "koa";

// TODO create 'server-test-support' library with skeleton implementation for this
test("Validate Koa middleware works for happy path", async (t) => {
  t.plan(1);
  const server = http.createServer(
    new Koa()
      .use(
        spec.createMiddleware([
          {
            getRegExpAndHandler: () => ({
              url: /(?<group>.*)/,
              handler: () => ({
                found: "handler",
                handler: {
                  contextValidator: {
                    validator: (ctx) => ({
                      error: "none",
                      data: ctx,
                    }),
                    getState: () => "State",
                  },
                  handler: (args) => ({
                    error: "none",
                    data: {
                      contentType: "application/json",
                      output: args.state as string,
                      headers: {
                        "response-header-name": "resposne-header-value",
                      },
                    },
                  }),
                },
              }),
            }),
            getMetadata: () => {
              throw new Error("This should never be called.");
            },
          },
        ]),
      )
      .callback(),
  );
  // AVA runs tests in parallel -> use plugin to get whatever available port
  const host = "127.0.0.1";
  const port = await getPort();
  const destroyServer = destroy.createDestroyCallback(server);
  try {
    // Start the server
    await listenAsync(server, host, port);

    // Send the request
    const response = await request.requestAsync({
      hostname: host,
      port,
      method: "GET",
    });
    // Let's not test this one as it varies every time
    delete response.headers["date"];
    t.deepEqual(response, {
      data: "State",
      headers: {
        connection: "close",
        "content-length": "5",
        "content-type": "application/json",
        "response-header-name": "resposne-header-value",
      },
    });
  } finally {
    try {
      // Shut down the server
      await destroyServer();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to destroy server, the test might become stuck...");
    }
  }
});

const listenAsync = (server: net.Server, host: string, port: number) =>
  new Promise<void>((resolve, reject) => {
    try {
      server.listen(port, host, () => resolve());
    } catch (e) {
      reject(e);
    }
  });
