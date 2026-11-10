import { Router, Request, Response } from 'express';
import { youtubeService } from '../services/youtube.service';

export const youtubeRouter = Router();

youtubeRouter.get('/latest', async (req: Request, res: Response) => {
  try {
    const data = await youtubeService.getLatestVideos();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar vídeos recentes' });
  }
});

youtubeRouter.get('/catalog', async (req: Request, res: Response) => {
  try {
    const data = await youtubeService.getLatestVideos();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar catálogo de vídeos' });
  }
});

youtubeRouter.get('/playlist/:category', async (req: Request, res: Response) => {
  try {
    const category = req.params.category?.toLowerCase() || '';
    const data = await youtubeService.getPlaylistVideos(category);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao carregar vídeos da playlist' });
  }
});

youtubeRouter.get('/presente7', async (req: Request, res: Response) => {
  try {
    const data = await youtubeService.getPlaylistVideos('presente7');
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao consultar episódios do Presente 7' });
  }
});

youtubeRouter.get('/live', async (req: Request, res: Response) => {
  try {
    const data = await youtubeService.getLiveStatus();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao consultar status da transmissão ao vivo' });
  }
});
