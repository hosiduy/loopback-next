// Copyright IBM Corp. 2017,2018. All Rights Reserved.
// Node module: @loopback/rest
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {supertest} from '@loopback/testlab';

import * as fs from 'fs';
import * as path from 'path';

import {ENDPOINT_FACTORY, HttpServerConfig, HandleHttp} from '../..';

describe('http-server-core (integration)', () => {
  const factory = ENDPOINT_FACTORY;

  it('supports http protocol', async () => {
    const endpoint = await givenEndpoint({port: 0}, async httpCtx => {
      httpCtx.response.write('Hello');
      httpCtx.response.end();
    });

    supertest(endpoint.url)
      .get('/')
      .expect(200, 'Hello');

    return new Promise<void>((resolve, reject) => {
      // tslint:disable-next-line:no-any
      endpoint.server.close((err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  it('supports https protocol', async () => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const key = fs.readFileSync(
      path.join(__dirname, '../../../test/integration/privatekey.pem'),
    );
    const cert = fs.readFileSync(
      path.join(__dirname, '../../../test/integration/certificate.pem'),
    );
    const endpoint = await givenEndpoint(
      {protocol: 'https', httpsServerOptions: {cert, key}, port: 0},
      async httpCtx => {
        httpCtx.response.write('Hello');
        httpCtx.response.end();
      },
    );

    supertest(endpoint.url)
      .get('/')
      .expect(200, 'Hello');
    delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;

    return new Promise<void>((resolve, reject) => {
      // tslint:disable-next-line:no-any
      endpoint.server.close((err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });
  });

  async function givenEndpoint(
    options: HttpServerConfig,
    handleHttp: HandleHttp,
  ) {
    return await factory.create(options || {}, handleHttp);
  }
});
