// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as express from 'express';
import * as http from 'http';
import * as https from 'https';

import {Request, Response, NextFunction} from 'express';
import {RestServerConfig, RestServer} from './rest-server';
import {RestBindings} from './keys';

export {
  Request,
  Response,
  NextFunction,
  Application as ExpressApplication,
} from 'express';

/**
 * This interface wraps http request/response and other information
 */
export interface HttpContext {
  // req: IncomingMessage; // Node.js http request
  // res: Response; // Node.js http response
  request: Request; // Express Request
  response: Response; // Express Response
  next?: NextFunction;
}

/**
 * Http request/response handler
 */
export type HandleHttp = (httpCtx: HttpContext) => Promise<void>;

/**
 * Create an endpoint for the given REST server configuration
 * @param restServer Rest server
 */
export function createServer(
  restServer: RestServer,
): Promise<http.Server | https.Server> {
  // Create an express representing the server endpoint
  const app = express();
  restServer.transport = app;
  restServer.bind(RestBindings.TRANSPORT).to(app);
  app.use((request, response, next) => {
    const httpCtx: HttpContext = {
      request,
      response,
      next,
    };
    restServer
      .handleHttp(httpCtx)
      .then(next)
      .catch(err => next(err));
  });

  const config = restServer.options;
  let server: http.Server | https.Server;
  if (config.protocol === 'https') {
    server = https.createServer(config.httpsServerOptions || {}, app);
  } else {
    // default to http
    server = http.createServer(app);
  }

  server.listen(config.port, config.host);

  return new Promise((resolve, reject) => {
    server.once('listening', () => {
      const port = server.address().port;
      restServer.options.port = port;
      restServer.bind(RestBindings.PORT).to(port);
      resolve(server);
    });
    server.once('error', reject);
  });
}
