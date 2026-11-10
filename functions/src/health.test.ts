import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';
import express from 'express';
import { createHealthRouter } from './health';
import { memoryCache } from './services/cache.service';
import { formsRouter } from './routes/forms.router';
import { notificationService } from './services/notification.service';

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

test('memoryCache.singleflight deduplicates concurrent calls to loader', async () => {
  memoryCache.clear();
  let loaderCalls = 0;

  const loader = async () => {
    loaderCalls += 1;
    await new Promise((resolve) => setTimeout(resolve, 20));
    return { items: [1, 2, 3] };
  };

  const results = await Promise.all([
    memoryCache.singleflight('test-sf', 60, loader),
    memoryCache.singleflight('test-sf', 60, loader),
    memoryCache.singleflight('test-sf', 60, loader),
  ]);

  assert.equal(loaderCalls, 1);
  assert.deepEqual(results[0], { items: [1, 2, 3] });
  assert.deepEqual(results[1], { items: [1, 2, 3] });
  assert.deepEqual(results[2], { items: [1, 2, 3] });
});

test('formsRouter POST /contato propagates persistence errors as 500 instead of false 200', async () => {
  const originalSave = notificationService.saveContato.bind(notificationService);
  notificationService.saveContato = async () => {
    throw new Error('Firestore write failed');
  };

  const app = express();
  app.use(express.json());
  app.use('/api', formsRouter);
  app.use((_err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    res.status(500).json({ error: 'Erro interno ao processar a requisição.' });
  });

  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address();
  assert(address && typeof address !== 'string');

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/api/contato`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Maria',
        email: 'maria@example.com',
        assunto: 'Dúvida',
        mensagem: 'Olá!',
      }),
    });
    assert.equal(response.status, 500);
  } finally {
    notificationService.saveContato = originalSave;
    server.close();
  }
});

