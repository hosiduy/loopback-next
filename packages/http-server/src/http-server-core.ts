// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/http-server
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as http from 'http';
import * as https from 'https';
import {
  BaseHttpContext,
  BaseHandleHttp,
  HttpEndpointFactory,
  HttpEndpoint,
  HttpServerConfig,
} from './types';
import * as debugModule from 'debug';
const debug = debugModule('loopback:http:server:core');

/**
 * Export specific types from this implementation
 */
export type Request = http.IncomingMessage;
export type Response = http.ServerResponse;
export type HttpContext = BaseHttpContext<Request, Response>;
export type HandleHttp = BaseHandleHttp<Request, Response>;

class CoreHttpEndpointFactory
  implements HttpEndpointFactory<Request, Response> {
  create(config: HttpServerConfig, handleHttp: HandleHttp) {
    let server: http.Server | https.Server;
    if (config.protocol === 'https') {
      debug('Creating https server: %s:%d', config.host || '', config.port);
      server = https.createServer(
        config.httpsServerOptions || {},
        (request, response) =>
          handleHttp({req: request, res: response, request, response}),
      );
    } else {
      debug('Creating http server: %s:%d', config.host || '', config.port);
      server = http.createServer((request, response) =>
        handleHttp({req: request, res: response, request, response}),
      );
    }

    server.listen(config.port, config.host);

    return new Promise<HttpEndpoint>((resolve, reject) => {
      server.once('listening', () => {
        const host = config.host || server.address().address;
        const port = server.address().port;
        config.port = port;
        config.host = host;
        const protocol = config.protocol || 'http';
        const url = `${protocol}://${host}:${port}`;
        debug('Server is ready at %s', url);
        resolve({server, url});
      });
      server.once('error', reject);
    });
  }
}

/**
 * A singleton instance of the core http endpoint factory
 */
export const ENDPOINT_FACTORY: HttpEndpointFactory<
  Request,
  Response
> = new CoreHttpEndpointFactory();
