import { Router, Request, Response } from 'express';

type ReadinessCheck = () => Promise<unknown>;

export function createHealthRouter(checkReadiness: ReadinessCheck): Router {
  const router = Router();

  router.get('/livez', (_req: Request, res: Response) => {
    return res.json({ status: 'ok' });
  });

  router.get('/readyz', async (_req: Request, res: Response) => {
    try {
      await checkReadiness();
      return res.json({ status: 'ready' });
    } catch (error) {
      console.error('Readiness check failed', error);
      return res.status(503).json({ status: 'not_ready' });
    }
  });

  return router;
}
