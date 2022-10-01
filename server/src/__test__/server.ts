import type * as ava from "ava";
import getPort from "@ava/get-port";

import * as destroy from "./destroy";
import * as request from "./request";

import type * as ep from "@ty-ras/endpoint";

import * as http from "http";
import type * as net from "net";

export const testServer = async (
  t: ava.ExecutionContext,
  createServer: (
    endpoint: Array<ep.AppEndpoint<unknown, never>>,
  ) => http.Server,
  errorInfoOrOverrideResponseContent:
    | undefined
    | {
        regExp: RegExp;
        expectedStatusCode: number;
      }
    | 204
    | 403,
) => {
  const isError = typeof errorInfoOrOverrideResponseContent === "object";
  const isProtocolError = errorInfoOrOverrideResponseContent === 403;
  const state = "State";
  const responseData =
    errorInfoOrOverrideResponseContent === 204 ? undefined : state;
  t.plan(isError || isProtocolError ? 2 : 1);
  const server = createServer([
    getAppEndpoint(
      isError
        ? errorInfoOrOverrideResponseContent?.regExp
        : /^\/(?<group>path)$/,
      isProtocolError ? errorInfoOrOverrideResponseContent : undefined,
      state,
      responseData,
    ),
  ]);
  // AVA runs tests in parallel -> use plugin to get whatever available port
  const host = "127.0.0.1";
  const port = await getPort();
  const destroyServer = destroy.createDestroyCallback(server);
  try {
    // Start the server
    await listenAsync(server, host, port);

    const requestOpts: http.RequestOptions = {
      hostname: host,
      port,
      method: "GET",
      path: "/path",
    };

    if (isError || errorInfoOrOverrideResponseContent === 403) {
      const expectedStatusCode = isError
        ? errorInfoOrOverrideResponseContent.expectedStatusCode
        : errorInfoOrOverrideResponseContent;
      const thrownError = await t.throwsAsync<request.RequestError>(
        async () => await request.requestAsync(requestOpts),
        {
          instanceOf: request.RequestError,
          message: request.getErrorMessage(expectedStatusCode),
        },
      );
      if (thrownError) {
        t.deepEqual(thrownError.statusCode, expectedStatusCode);
      }
    } else {
      // Send the request
      const response = await request.requestAsync(requestOpts);
      // Let's not test this one as it varies every time
      delete response.headers["date"];
      const expectedHeaders: Record<string, string> = {
        connection: "close",
        "response-header-name": "response-header-value",
      };
      if (responseData !== undefined) {
        expectedHeaders["content-length"] = "5";
        expectedHeaders["content-type"] = "application/json";
      }
      t.deepEqual(response, {
        data: responseData,
        headers: expectedHeaders,
      });
    }
  } finally {
    try {
      // Shut down the server
      await destroyServer();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Failed to destroy server, the test might become stuck...");
    }
  }
};

const getAppEndpoint = (
  regExp: RegExp,
  protocolError: number | undefined,
  state: string,
  output: string | undefined,
): ep.AppEndpoint<unknown, never> => ({
  getRegExpAndHandler: () => ({
    url: regExp,
    handler: () => ({
      found: "handler",
      handler: {
        contextValidator: {
          validator: (ctx) =>
            protocolError === undefined
              ? {
                  error: "none",
                  data: ctx,
                }
              : {
                  error: "protocol-error",
                  statusCode: 403,
                  body: undefined,
                },
          getState: () => state,
        },
        handler: () => ({
          error: "none",
          data: {
            contentType: "application/json",
            output,
            headers: {
              "response-header-name": "response-header-value",
            },
          },
        }),
      },
    }),
  }),
  getMetadata: () => {
    throw new Error("This should never be called.");
  },
});

const listenAsync = (server: net.Server, host: string, port: number) =>
  new Promise<void>((resolve, reject) => {
    try {
      server.listen(port, host, () => resolve());
    } catch (e) {
      reject(e);
    }
  });
