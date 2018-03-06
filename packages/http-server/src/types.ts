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
  protocol?: 'http' | 'https';
  port?: number;
  host?: string;
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
 * This interface wraps http request/response and other information
 */
export interface BaseHttpContext<REQ, RES> {
  req: http.IncomingMessage;
  res: http.ServerResponse;
  request: REQ;
  response: RES;
  // tslint:disable-next-line:no-any
  next?: (() => Promise<any>) | ((err: any) => void);
}

/**
 * Http request/response handler
 */
export type BaseHandleHttp<REQ, RES> = (
  httpCtx: BaseHttpContext<REQ, RES>,
) => Promise<void>;

/**
 * Create an endpoint for the given REST server configuration
 */
export interface HttpEndpointFactory<REQ, RES> {
  /**
   * Create a http/https endpoint for the configuration and handler
   * @param config The configuration
   * @param handleHttp The http request/response handler
   */
  create(
    config: HttpServerConfig,
    handleHttp: BaseHandleHttp<REQ, RES>,
  ): Promise<HttpEndpoint>;
}
