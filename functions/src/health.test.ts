import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';
import express from 'express';
import { createHealthRouter } from './health';

async function request(path: string): Promise<Response> {
  const app = express();
  app.use(createHealthRouter(async () => undefined));
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  assert(address && typeof address !== 'string');

  try {
    return await fetch(`http://127.0.0.1:${address.port}${path}`);
  } finally {
    server.close();
  }
}

test('livez responds without checking infrastructure', async () => {
  const response = await request('/livez');

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok' });
});

test('readyz responds 503 when infrastructure is unavailable', async () => {
  const app = express();
  app.use(
    createHealthRouter(async () => {
      throw new Error('Firestore unavailable');
    })
  );
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  assert(address && typeof address !== 'string');

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/readyz`);
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), { status: 'not_ready' });
  } finally {
    server.close();
  }
});

test('readyz responds 200 when infrastructure is available', async () => {
  const app = express();
  app.use(createHealthRouter(async () => undefined));
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  assert(address && typeof address !== 'string');

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/readyz`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ready' });
  } finally {
    server.close();
  }
});
