/**
 * @file This types-only file refines generic TyRAS server-related types to Koa -specific types.
 */

import type * as server from "@ty-ras/server";
import type * as koa from "koa";

/**
 * This is server context for Koa server.
 */
export type ServerContext = koa.ParameterizedContext;

/**
 * This is type for callbacks which create endpoint-specific state when processing requests in Node HTTP1 or HTTP2 server.
 */
export type CreateState<TStateInfo> = server.StateProvider<
  ServerContext,
  TStateInfo
>;
