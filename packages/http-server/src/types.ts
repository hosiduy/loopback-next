// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/http-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as http from 'http';
import * as https from 'https';

/**
 * Options to configure the http server
 */
export type HttpServerConfig = {
  /**
   * Protocol, default to `http`
   */
  protocol?: 'http' | 'https'; // Will be extended to `http2` in the future
  /**
   * Port number, default to `0` (ephemeral)
   */
  port?: number;
  /**
   * Host names/addresses to listen on
   */
  host?: string;
  /**
   * Options for https, such as `cert` and `key`.
   */
  httpsServerOptions?: https.ServerOptions;
};

/**
 * Http endpoint
 */
export type HttpEndpoint = {
  server: http.Server | https.Server;
  url: string;
  // tslint:disable-next-line:no-any
  container?: any; // Such as Express `app`
};

/**
 * This interface wraps http request/response and other information. It's
 * designed to be used by `http-server-*` modules to provide the concrete
 * types for `REQ` and `RES`.
 */
export interface BaseHttpContext<REQ, RES> {
  /**
   * The Node.js core http request
   */
  req: http.IncomingMessage;
  /**
   * The Node.js core http response
   */
  res: http.ServerResponse;
  /**
   * Framework specific http request. For example `Express` has its own
   * `Request` that extends from `http.IncomingMessage`
   */
  request: REQ;
  /**
   * Framework specific http response. For example `Express` has its own
   * `Response` that extends from `http.ServerResponse`
   */
  response: RES;
  /**
   * Next handler
   */
  // tslint:disable-next-line:no-any
  next?: (() => Promise<any>) | ((err: any) => void);
}

/**
 * Http request/response handler. It's designed to be used by `http-server-*`
 * modules to provide the concrete types for `REQ` and `RES`.
 */
export type BaseHandleHttp<REQ, RES> = (
  httpCtx: BaseHttpContext<REQ, RES>,
) => Promise<void>;

/**
 * Create an endpoint for the given REST server configuration
 */
export interface HttpEndpointFactory<REQ, RES> {
  /**
   * Create an http/https endpoint for the configuration and handler
   * @param config The configuration for the http server
   * @param handleHttp The http request/response handler
   */
  create(
    config: HttpServerConfig,
    handleHttp: BaseHandleHttp<REQ, RES>,
  ): Promise<HttpEndpoint>;
}
