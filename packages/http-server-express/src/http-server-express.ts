// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/http-server-express
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as http from 'http';
import * as https from 'https';
import * as debugModule from 'debug';
const debug = debugModule('loopback:http:server:express');

import {
  BaseHttpContext,
  BaseHandleHttp,
  HttpEndpointFactory,
  HttpEndpoint,
  HttpServerConfig,
} from '@loopback/http-server';

import * as express from 'express';
import {Request, Response} from 'express';

export {
  Request,
  Response,
  NextFunction,
  Application as ExpressApplication,
} from 'express';

export {HttpEndpoint, HttpServerConfig} from '@loopback/http-server';
export type HttpContext = BaseHttpContext<Request, Response>;
export type HandleHttp = BaseHandleHttp<Request, Response>;

class ExpressHttpEndpointFactory
  implements HttpEndpointFactory<Request, Response> {
  create(config: HttpServerConfig, handleHttp: HandleHttp) {
    // Create an express representing the server endpoint
    const app = express();
    app.use((request, response, next) => {
      const httpCtx: HttpContext = {
        req: request,
        res: response,
        request,
        response,
        next,
      };
      handleHttp(httpCtx)
        .then(next)
        .catch(err => next(err));
    });

    let server: http.Server | https.Server;
    if (config.protocol === 'https') {
      server = https.createServer(config.httpsServerOptions || {}, app);
    } else {
      // default to http
      server = http.createServer(app);
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
        resolve({server, url, container: app});
      });
      server.once('error', reject);
    });
  }
}

export const ENDPOINT_FACTORY: HttpEndpointFactory<
  Request,
  Response
> = new ExpressHttpEndpointFactory();
