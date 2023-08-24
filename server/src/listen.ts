/**
 * @file This file contains function that can be used to expose uniform way to listen to TyRAS servers.
 */

import type * as server from "./server";
import * as serverGeneric from "@ty-ras/server";

import * as http from "node:http";
import * as https from "node:https";
import * as http2 from "node:http2";
import * as net from "node:net";
import type * as tls from "node:tls";

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
    createNodeServerGeneric(opts, server.callback()),
    typeof hostOrOptions === "string" ? hostOrOptions : hostOrOptions.listen,
    port,
    backlog,
  );
}

/**
 * Creates new non-secure HTTP1 {@link http.Server} serving given TyRAS {@link ep.AppEndpoint}s with additional configuration via {@link ServerCreationOptions}.
 * @param handler The {@link HTTP1Handler} callback.
 * @param opts The {@link ServerCreationOptions} to use when creating server.
 * @returns A new non-secure HTTP1 {@link http.Server}.
 */
export function createNodeServer(
  handler: HTTP1Handler,
  opts?: ServerOptions1<false>,
): http.Server;

/**
 * Creates new secure HTTP1 {@link https.Server} serving given TyRAS {@link ep.AppEndpoint}s with additional configuration via {@link ServerCreationOptions}.
 * @param opts The {@link ServerCreationOptions} to use when creating server.
 * @param handler The {@link HTTP1Handler} callback.
 * @returns A new secure HTTP1 {@link https.Server}.
 */
export function createNodeServer(
  opts: ServerOptions1<true>,
  handler: HTTP1Handler,
): https.Server;

/**
 * Creates new non-secure HTTP2 {@link http2.Http2Server} serving given TyRAS {@link ep.AppEndpoint}s with additional configuration via {@link ServerCreationOptions}.
 * Please set `httpVersion` value of `opts` to `2` to use HTTP2 protocol.
 * @param opts The {@link ServerCreationOptions} to use when creating server.
 * @param handler The {@link HTTP2Handler} callback.
 * @returns A new non-secure HTTP2 {@link http2.Http2Server}.
 */
export function createNodeServer(
  opts: ServerOptions2<false>,
  handler: HTTP2Handler,
): http2.Http2Server;

/**
 * Creates new secure HTTP2 {@link http2.Http2SecureServer} serving given TyRAS {@link ep.AppEndpoint}s with additional configuration via {@link ServerCreationOptions}.
 * Please set `httpVersion` value of `opts` to `2` to use HTTP2 protocol.
 * @param opts The {@link ServerCreationOptions} to use when creating server.
 * @param handler The {@link HTTP2Handler} callback.
 * @returns A new secure HTTP2 {@link http2.Http2SecureServer}.
 */
export function createNodeServer(
  opts: ServerOptions2<true>,
  handler: HTTP2Handler,
): http2.Http2SecureServer;

/**
 * Creates new secure or non-secure HTTP1 or HTTP2 Node server serving given TyRAS {@link ep.AppEndpoint}s with additional configuration via {@link ServerCreationOptions}.
 * Please set `httpVersion` value of `opts` to `2` to enable HTTP2 protocol, otherwise HTTP1 server will be returned.
 * @param handler The {@link HTTP1Handler} or {@link ServerOptions1} or {@link ServerOptions2}.
 * @param options The {@link ServerOptions1} or {@link HTTP1Handler} or {@link HTTP2Handler}.
 * @returns Secure or non-secure HTTP1 or HTTP2 Node server
 * @see createNodeServerGeneric
 */
export function createNodeServer(
  handler: HTTP1Handler | ServerOptions1<true> | ServerOptions2<boolean>,
  options?: ServerOptions1<false> | HTTP1Handler | HTTP2Handler,
): http.Server | https.Server | http2.Http2Server | http2.Http2SecureServer {
  return createNodeServerGeneric(
    typeof handler === "function"
      ? ensureObject<ServerOptions1<false>, HTTP1Handler | HTTP2Handler>(
          options ?? { options: {} },
        )
      : handler ??
          doThrow(
            "The HTTP server options are mandatory when creating anything other than unsecured HTTP1 server.",
          ),
    typeof handler === "function"
      ? handler
      : typeof options === "function"
      ? options
      : doThrow("The HTTP server callback must be specified."),
  );
}

/**
 * Creates new secure or non-secure HTTP1 or HTTP2 Node server with given callback.
 * Please set `httpVersion` value of `opts` to `2` to enable HTTP2 protocol, otherwise HTTP1 server will be returned.
 * @param opts The {@link ServerOptions1} or {@link ServerOptions2} options.
 * @param handler The {@link HTTP1Handler} or {@link HTTP2Handler} callback.
 * @returns Secure or non-secure HTTP1 or HTTP2 Node server
 */
export function createNodeServerGeneric(
  opts: ServerOptions1<boolean> | ServerOptions2<boolean>,
  handler: HTTP1Handler | HTTP2Handler,
): http.Server | https.Server | http2.Http2Server | http2.Http2SecureServer {
  let retVal;
  if ("httpVersion" in opts && opts.httpVersion === 2) {
    const { options, secure } = opts;
    const httpHandler = asyncToVoid(handler);
    if (isSecure(secure, options, 2)) {
      retVal = http2.createSecureServer(options ?? {}, httpHandler);
    } else {
      retVal = http2.createServer(options ?? {}, httpHandler);
    }
  } else {
    const { options, secure } = opts;
    const httpHandler = asyncToVoid(handler);
    if (isSecure(secure, options, 1)) {
      retVal = https.createServer(options ?? {}, httpHandler);
    } else {
      retVal = http.createServer(options ?? {}, httpHandler);
    }
  }
  return retVal;
}

/**
 * This interface contains options common for both HTTP 1 and 2 servers when creating them via {@link createNodeServer}.
 */
export interface ServerOptionsBase<TOptions, TSecure extends boolean> {
  /**
   * The further options for the HTTP server.
   */
  options: TOptions;

  /**
   * Set this to `true` explicitly if automatic detection of server being secure by {@link createNodeServer} fails.
   */
  secure?: TSecure;
}

/**
 * This interface contains options for HTTP 1 servers when creating them via {@link createNodeServer}.
 */
export interface ServerOptions1<TSecure extends boolean>
  extends ServerOptionsBase<
    boolean extends TSecure
      ? http.ServerOptions | https.ServerOptions
      : true extends TSecure
      ? https.ServerOptions
      : http.ServerOptions,
    TSecure
  > {
  /**
   * Use this property if needed.
   */
  httpVersion?: 1;
}

/**
 * This interface contains options for HTTP 2 servers when creating them via {@link createNodeServer}.
 */
export interface ServerOptions2<TSecure extends boolean>
  extends ServerOptionsBase<
    boolean extends TSecure
      ? http2.ServerOptions | http2.SecureServerOptions
      : true extends TSecure
      ? http2.SecureServerOptions
      : http2.ServerOptions,
    TSecure
  > {
  /**
   * Set this property to `2` in order to use HTTP2 server when listening.
   */
  httpVersion: 2;
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
  extends ServerOptions1<boolean>,
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
  extends ServerOptions2<boolean>,
    ListenOptionsBase {
  /**
   * Set this property to `2` in order to use HTTP2 server when listening.
   */
  httpVersion: 2;
}

const isSecure = (
  secure: boolean | undefined,
  options: object | undefined,
  version: 1 | 2,
) =>
  secure ||
  (options &&
    (version === 1 ? secureHttp1OptionKeys : secureHttp2OptionKeys).some(
      (propKey) => propKey in options,
    ));

const secureHttp1OptionKeys: ReadonlyArray<keyof tls.TlsOptions> = [
  "key",
  "cert",
  "pfx",
  "passphrase",
  "rejectUnauthorized",
  "ciphers",
  "ca",
  "requestCert",
  "secureContext",
  "secureOptions",
  "secureProtocol",
  "sigalgs",
  "ticketKeys",
  "crl",
  "clientCertEngine",
  "dhparam",
  "ecdhCurve",
  "allowHalfOpen",
  "handshakeTimeout",
  "honorCipherOrder",
  "keepAlive",
  "keepAliveInitialDelay",
  "maxVersion",
  "minVersion",
  "noDelay",
  "pauseOnConnect",
  "privateKeyEngine",
  "privateKeyIdentifier",
  "pskCallback",
  "pskIdentityHint",
  "sessionIdContext",
  "sessionTimeout",
  "ALPNProtocols",
  "SNICallback",
];

const secureHttp2OptionKeys: ReadonlyArray<
  "allowHTTP1" | "origins" | keyof tls.TlsOptions
> = ["allowHTTP1", "origins", ...secureHttp1OptionKeys];

const asyncToVoid =
  (
    asyncCallback: HTTP1Handler | HTTP2Handler,
  ): ((...args: Parameters<typeof asyncCallback>) => void) =>
  (...args) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    void asyncCallback(...(args as [any, any]));
  };

/**
 * Generic callback interface used by {@link HTTP1Handler} and {@link HTTP2Handler}.
 */
export type HTTP1Or2Handler<TRequest, TResponse> = (
  req: TRequest,
  res: TResponse,
) => Promise<void>;

/**
 * The callback type for HTTP1 servers.
 */
export type HTTP1Handler = HTTP1Or2Handler<
  http.IncomingMessage,
  http.ServerResponse
>;

/**
 * The callback type for HTTP2 servers.
 */
export type HTTP2Handler = HTTP1Or2Handler<
  http2.Http2ServerRequest,
  http2.Http2ServerResponse
>;

const doThrow = (msg: string) => {
  throw new Error(msg);
};

const ensureObject = <
  TObject extends object,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TFunction extends (...args: Array<any>) => any,
>(
  obj: TObject | TFunction,
): TObject => (typeof obj === "function" ? doThrow("Please pass object") : obj);
