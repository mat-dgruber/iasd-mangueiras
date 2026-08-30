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
      // Permite chamadas sem origin (mobile/curl/SSR) ou domínios autorizados
      if (!origin || config.corsOrigins.includes(origin) || origin.endsWith('.web.app') || origin.endsWith('.firebaseapp.com')) {
        callback(null, true);
      } else {
        callback(null, true); // Permissivo para evitar bloqueios em dev
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
  },
  app
);
