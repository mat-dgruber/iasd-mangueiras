import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import express from 'express';
import cors from 'cors';
import { config } from './config';
import { youtubeRouter } from './routes/youtube.router';
import { formsRouter } from './routes/forms.router';

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

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: config.appName, env: config.appEnv });
});

// Rotas da API
app.use('/api/youtube', youtubeRouter);
app.use('/api', formsRouter);

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
