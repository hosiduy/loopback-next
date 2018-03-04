// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {Context} from '@loopback/context';
import {PathsObject, SchemasObject} from '@loopback/openapi-v3-types';
import {ControllerSpec} from '@loopback/openapi-v3';

import {SequenceHandler} from './sequence';
import {
  RoutingTable,
  ResolvedRoute,
  RouteEntry,
  ControllerClass,
} from './router/routing-table';
import {Request, HttpContext} from './internal-types';

import {RestBindings} from './keys';

export class HttpHandler {
  protected _routes: RoutingTable = new RoutingTable();
  protected _apiDefinitions: SchemasObject;

  public handleRequest: (httpCtx: HttpContext) => Promise<void>;

  constructor(protected _rootContext: Context) {
    this.handleRequest = httpCtx => this._handleRequest(httpCtx);
  }

  registerController(name: ControllerClass, spec: ControllerSpec) {
    this._routes.registerController(name, spec);
  }

  registerRoute(route: RouteEntry) {
    this._routes.registerRoute(route);
  }

  registerApiDefinitions(defs: SchemasObject) {
    this._apiDefinitions = Object.assign({}, this._apiDefinitions, defs);
  }

  getApiDefinitions() {
    return this._apiDefinitions;
  }

  describeApiPaths(): PathsObject {
    return this._routes.describeApiPaths();
  }

  findRoute(request: Request): ResolvedRoute {
    return this._routes.find(request);
  }

  protected async _handleRequest(httpCtx: HttpContext): Promise<void> {
    const requestContext = this._createRequestContext(httpCtx);

    const sequence = await requestContext.get<SequenceHandler>(
      RestBindings.SEQUENCE,
    );
    await sequence.handle(httpCtx);
  }

  protected _createRequestContext(httpCtx: HttpContext): Context {
    const requestContext = new Context(this._rootContext);
    requestContext.bind(RestBindings.Http.REQUEST).to(httpCtx.request);
    requestContext.bind(RestBindings.Http.RESPONSE).to(httpCtx.response);
    requestContext.bind(RestBindings.Http.CONTEXT).to(requestContext);
    return requestContext;
  }
}
