/**
 * @file This file contains function that can be used to expose uniform way to listen to TyRAS servers.
 */

import type * as server from "./server";
import * as serverGeneric from "@ty-ras/server";
import * as serverNode from "./server-node";
import * as net from "node:net";

/**
 * The helper function to listen to given {@link server.HttpServer} asynchronously.
 * @param server The {@link server.HttpServer} to listen to.
 * @param host The hostname as string.
 * @param port The port as number.
 * @param backlog The backlog parameter, if any.
 * @returns Asynchronously nothing.
 */
export function listenAsync(
  server: server.HttpServer,
  host: string,
  port: number,
  backlog?: number,
): Promise<void>;

/**
 *The helper function to listen to given {@link server.HttpServer} asynchronously.
 * @param server The {@link server.HttpServer} to listen to.
 * @param options The options for listening.
 * @returns Asynchronously nothing.
 */
export function listenAsync(
  server: server.HttpServer,
  options: ListenOptions1 | ListenOptions2,
): Promise<void>;

/**
 * The helper function to listen to given {@link server.HttpServer} asynchronously.
 * @param server The {@link server.HttpServer} to listen to.
 * @param hostOrOptions The {@link net.ListenOptions}.
 * @param port The port to listen to.
 * @param backlog The backlog parameter, if any.
 * @returns Asynchronously nothing.
 */
export function listenAsync(
  server: server.HttpServer,
  hostOrOptions: string | ListenOptions1 | ListenOptions2,
  port?: number,
  backlog?: number,
) {
  const opts: ListenOptions1 | ListenOptions2 =
    typeof hostOrOptions === "string"
      ? {
          options: {},
          listen: {
            host: hostOrOptions,
            port,
            backlog,
          },
        }
      : hostOrOptions;

  return serverGeneric.listenAsyncGeneric(
    serverNode.createNodeServerGeneric(opts, server.callback()),
    typeof hostOrOptions === "string" ? hostOrOptions : hostOrOptions.listen,
    port,
    backlog,
  );
}

/**
 * This interface contains options for both HTTP 1 and 2 servers when listening to them via {@link listenAsync}.
 */
export interface ListenOptionsBase {
  /**
   * Options related to listening for connections.
   */
  listen: net.ListenOptions;
}

/**
 * This interface contains options for HTTP 1 servers when listening to them via {@link listenAsync}.
 */
export interface ListenOptions1
  extends serverNode.ServerOptions1<boolean>,
    ListenOptionsBase {
  /**
   * Use this property if needed.
   */
  httpVersion?: 1;
}

/**
 * This interface contains options for HTTP 2 servers when listening to them via {@link listenAsync}.
 */
export interface ListenOptions2
  extends serverNode.ServerOptions2<boolean>,
    ListenOptionsBase {
  /**
   * Set this property to `2` in order to use HTTP2 server when listening.
   */
  httpVersion: 2;
}
