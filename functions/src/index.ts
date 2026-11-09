import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import express from 'express';
import cors from 'cors';
import { apiReference } from '@scalar/express-api-reference';
import { config } from './config';
import { createHealthRouter } from './health';
import { youtubeRouter } from './routes/youtube.router';
import { formsRouter } from './routes/forms.router';
import { openApiSpec } from './openapi';

// Inicializa Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp();
}

const app = express();

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      // Permite chamadas sem origin (mobile/curl/SSR) ou domínios autorizados, ou em dev
      if (
        !origin ||
        config.corsOrigins.includes(origin) ||
        origin.endsWith('.web.app') ||
        origin.endsWith('.firebaseapp.com') ||
        config.appEnv === 'development'
      ) {
        callback(null, true);
      } else {
        callback(new Error('Bloqueado pelo CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// MARK: - Health Checks
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', app: config.appName, env: config.appEnv });
});
app.use(createHealthRouter(() => admin.firestore().collection('_health').limit(1).get()));

// MARK: - OpenAPI & Scalar API Reference (Non-Production Only)
if (config.appEnv !== 'production') {
  app.get('/openapi.json', (_req, res) => {
    res.json(openApiSpec);
  });
  app.use(
    '/scalar',
    apiReference({
      spec: {
        content: openApiSpec,
      },
      theme: 'kepler',
      layout: 'modern',
    })
  );
} else {
  app.get(['/scalar', '/openapi.json'], (_req, res) => {
    res.status(404).send('Not Found');
  });
}

// MARK: - Domain Routes
app.use('/api/youtube', youtubeRouter);
app.use('/api', formsRouter);

// MARK: - Global Error Handler (Legacy v1 + RFC 9457 ProblemDetails)
/**
 * Middleware central de tratamento de erros HTTP.
 * Preserva o envelope `{ error }` para clientes legados e emite `application/problem+json` (RFC 9457)
 * quando solicitado via cabeçalho `Accept` ou em rotas `/api/v2`.
 */
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    const status = err.message === 'Bloqueado pelo CORS' ? 403 : 500;
    const title = status === 403 ? 'Forbidden' : 'Internal Server Error';
    const detail =
      status === 403 ? 'Origem não autorizada pela política de CORS.' : 'Erro interno ao processar a requisição.';

    if (
      req.headers.accept?.includes('application/problem+json') ||
      req.path.startsWith('/api/v2')
    ) {
      res.status(status).type('application/problem+json').json({
        type: 'about:blank',
        title,
        status,
        detail,
        instance: req.originalUrl,
      });
      return;
    }

    res.status(status).json({ error: detail });
  }
);

// Exporta a Cloud Function HTTP v2
export const api = functions.https.onRequest(
  {
    region: 'southamerica-east1',
    cors: true,
    memory: '256MiB',
    timeoutSeconds: 30,
    minInstances: 0,
    maxInstances: 10,
    secrets: ['YOUTUBE_API_KEY', 'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID'],
  },
  app
);
