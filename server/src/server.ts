/**
 * @file This file exposes function to create Node HTTP 1 or 2 server serving giving TyRAS {@link ep.AppEndpoint}s.
 */

import * as server from "@ty-ras/server";
import Koa from "koa";

import type * as ctx from "./context.types";
import * as middleware from "./middleware";

/**
 * Creates new {@link Koa} server serving given TyRAS {@link ep.AppEndpoint}s with additional configuration via {@link ServerCreationOptions}.
 * Please set `httpVersion` value of `opts` to `2` to enable HTTP2 protocol, otherwise HTTP1 server will be returned.
 * @param opts The {@link ServerCreationOptions} to use when creating server.
 * @param opts.endpoints Privately deconstructed variable.
 * @param opts.createState Privately deconstructed variable.
 * @param opts.events Privately deconstructed variable.
 * @param opts.options Privately deconstructed variable.
 * @returns Secure or non-secure HTTP1 or HTTP2 Node server
 */
export function createServer<TStateInfo, TState>({
  endpoints,
  createState,
  events,
  options,
}: ServerCreationOptions<TStateInfo, TState>): HttpServer {
  return new Koa(options).use(
    middleware.createMiddleware(endpoints, createState, events),
  );
}

/**
 * This interface contains options common for both HTTP 1 and 2 servers when creating them via {@link createServer}.
 */
export interface ServerCreationOptions<TStateInfo, TState> {
  /**
   * The TyRAS {@link ep.AppEndpoint}s to server via returned HTTP server.
   */
  endpoints: server.ServerEndpoints<ctx.ServerContext, TStateInfo>;

  /**
   * The callback to create endpoint-specific state objects.
   */
  createState?: ctx.CreateState<TStateInfo> | undefined;

  /**
   * The callback for tracking events occurred within the server.
   */
  events?:
    | server.ServerEventHandler<server.GetContext<ctx.ServerContext>, TState>
    | undefined;

  /**
   * Optional options to {@link Koa} constructor.
   */
  options?: KoaOptions;
}

/**
 * This type contains all the options one can give to Koa server.
 */
export type KoaOptions = Exclude<
  ConstructorParameters<typeof Koa>[0],
  undefined
>;

/**
 * This type contains all the HTTP server types that can be created with TyRAS backend for Koa servers.
 */
export type HttpServer = Koa;
