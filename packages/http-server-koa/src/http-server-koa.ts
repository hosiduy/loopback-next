// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/http-server-koa
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import * as http from 'http';
import * as https from 'https';
import * as debugModule from 'debug';
const debug = debugModule('loopback:http:server:koa');

import {
  BaseHttpContext,
  BaseHandleHttp,
  HttpEndpointFactory,
  HttpEndpoint,
  HttpServerConfig,
} from '@loopback/http-server';

import * as Koa from 'koa';

import {Request, Response} from 'koa';
export {Request, Response} from 'koa';

export {HttpEndpoint, HttpServerConfig} from '@loopback/http-server';
export type HttpContext = BaseHttpContext<Request, Response>;
export type HandleHttp = BaseHandleHttp<Request, Response>;

class koaHttpEndpointFactory implements HttpEndpointFactory<Request, Response> {
  create(config: HttpServerConfig, handleHttp: HandleHttp) {
    // Create an koa representing the server endpoint
    const app = new Koa();
    app.use(async (koaCtx, next) => {
      const httpCtx: HttpContext = {
        req: koaCtx.req,
        res: koaCtx.res,
        request: koaCtx.request,
        response: koaCtx.response,
        next: next,
      };
      await handleHttp(httpCtx);
      await next();
    });

    let server: http.Server | https.Server;
    if (config.protocol === 'https') {
      server = https.createServer(
        config.httpsServerOptions || {},
        app.callback,
      );
    } else {
      // default to http
      server = http.createServer(app.callback);
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
> = new koaHttpEndpointFactory();
