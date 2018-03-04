// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/testlab
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

/*
 * HTTP client utilities
 */

import * as express from 'express';
import {Request, Response} from 'express';
import supertest = require('supertest');

export type HttpContext = {
  request: Request;
  response: Response;
};

export {supertest};

export type Client = supertest.SuperTest<supertest.Test>;

function isHttpContextStyle(
  handler:
    | ((req: Request, res: Response) => void)
    | ((httpCtx: HttpContext) => void),
): handler is (httpCtx: HttpContext) => void {
  return handler.length === 1;
}
/**
 * Create a SuperTest client connected to an HTTP server listening
 * on an ephemeral port and calling `handler` to handle incoming requests.
 * @param handler
 */
export function createClientForHandler(
  handler:
    | ((req: Request, res: Response) => void)
    | ((httpCtx: HttpContext) => void),
): Client {
  const expressApp = express();
  if (isHttpContextStyle(handler)) {
    const originalHandler = handler;
    handler = (req: Request, res: Response) =>
      originalHandler({
        request: req,
        response: res,
      });
  }
  expressApp.use(handler);
  return supertest(expressApp);
}

export async function createClientForRestServer(
  server: RestServer,
): Promise<Client> {
  await server.start();
  const port =
    server.options && server.options.port ? server.options.port : 3000;
  const protocol = (server.options && server.options.protocol) || 'http';
  const url = `${protocol}://127.0.0.1:${port}`;
  // TODO(bajtos) Find a way how to stop the server after all tests are done
  return supertest(url);
}

// These interfaces are meant to partially mirror the formats provided
// in our other libraries to avoid circular imports.
export interface RestServer {
  start(): Promise<void>;
  options?: {
    // tslint:disable-next-line:no-any
    [prop: string]: any;
  };
}
