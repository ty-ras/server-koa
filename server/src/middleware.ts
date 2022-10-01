import type * as ep from "@ty-ras/endpoint";
import * as prefix from "@ty-ras/endpoint-prefix";
import * as server from "@ty-ras/server";
import type * as koa from "koa";

// Important: This middleware *will not create* state objects required by endpoints!
// It assumes some other middleware before this one will do so!
export const createMiddleware = <TState>(
  endpoints: Array<
    ep.AppEndpoint<koa.ParameterizedContext<TState>, Record<string, unknown>>
  >,
  events?: server.ServerEventEmitter<koa.ParameterizedContext<TState>, TState>,
): koa.Middleware<TState> => {
  // Combine given endpoints into top-level entrypoint
  const regExpAndHandler = prefix
    .atPrefix("", ...endpoints)
    .getRegExpAndHandler("");
  // Return Koa middleware handler factory
  return async (ctx) => {
    await server.typicalServerFlow(ctx, regExpAndHandler, events, {
      getURL: (ctx) => ctx.URL,
      getState: (ctx) => ctx.state,
      getMethod: (ctx) => ctx.method,
      // Use ctx.request.headers instead of ctx.get, as ctx.get returns empty string if header not set.
      // It may not be the desired behaviour.
      getHeader: (ctx, headerName) => ctx.request.header[headerName],
      getRequestBody: (ctx) => ctx.req,
      setHeader: (ctx, headerName, headerValue) =>
        ctx.set(headerName, headerValue),
      setStatusCode: (ctx, statusCode, willCallSendContent) => {
        ctx.status = statusCode;
        if (!willCallSendContent) {
          // Otherwise there will be some textual content, e.g. "Not Found"
          ctx.body = "";
        }
      },
      sendContent: (ctx, content) => {
        if (ctx.status !== 204 && content === undefined) {
          content = "";
        }
        ctx.body = content;
      },
    });
  };
};
