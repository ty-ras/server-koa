/**
 * @file This file contains internal code for e.g. implementing Koa HTTP server -specific functionality of {@link server.ServerFlowCallbacksWithoutState}.
 */

import type * as server from "@ty-ras/server";
import type * as ctx from "./context.types";

/**
 * This object implements the {@link server.ServerFlowCallbacksWithoutState} functionality for Koa servers.
 */
export const staticCallbacks: server.ServerFlowCallbacksWithoutState<ctx.ServerContext> =
  {
    // I have no idea why Koa typings expose all kind of things here, but e.g. "URL" property lacks in most cases, etc.
    // This seems to be the safest bet...
    getURL: (ctx) => ctx.request.url,
    getMethod: (ctx) => ctx.request.method,
    // Use ctx.request.headers instead of ctx.get, as ctx.get returns empty string if header not set.
    // It may not be the desired behaviour.
    getHeader: (ctx, headerName) => ctx.request.header[headerName],
    getRequestBody: (ctx) => ctx.req,
    setHeader: ({ response }, headerName, headerValue) =>
      response.set(headerName, headerValue),
    setStatusCode: ({ response }, statusCode, willCallSendContent) => {
      response.status = statusCode;
      if (!willCallSendContent) {
        // Otherwise there will be some textual content, e.g. "Not Found"
        response.body = "";
      }
    },
    sendContent: ({ response }, content) => {
      if (response.status !== 204 && content === undefined) {
        content = "";
      }
      response.body = content;
    },
  };
