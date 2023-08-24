/**
 * @file This file contains helper function to create Koa middleware callback.
 */

import type * as ep from "@ty-ras/endpoint";
import * as server from "@ty-ras/server";
import type * as koa from "koa";
import type * as context from "./context.types";
import * as internal from "./internal";

/**
 * Creates a new {@link koa.Middleware} to serve the given TyRAS {@link ep.AppEndpoint}s.
 * @param endpoints The TyRAS {@link ep.AppEndpoint}s to serve through this Koa middleware.
 * @param createState The optional callback to create state for the endpoints.
 * @param events The optional {@link server.ServerEventHandler} callback to observe server events.
 * @returns The Koa middleware which will serve the given endpoints.
 */
export const createMiddleware = <TStateInfo>(
  endpoints: ReadonlyArray<ep.AppEndpoint<context.ServerContext, TStateInfo>>,
  createState?: context.CreateState<TStateInfo>,
  events?: server.ServerEventHandler<
    server.GetContext<context.ServerContext>,
    TStateInfo
  >,
): koa.Middleware<TStateInfo> => {
  return server.createTypicalServerFlow(
    endpoints,
    {
      ...internal.staticCallbacks,
      getState: async (ctx, stateInfo) =>
        await createState?.({ context: ctx, stateInfo }),
    },
    events,
  );
};
