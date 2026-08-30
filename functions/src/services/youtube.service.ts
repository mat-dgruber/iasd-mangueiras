import { XMLParser } from 'fast-xml-parser';
import { config } from '../config';
import { VideoItem, YouTubeLatestResponse, YouTubeLiveResponse } from '../models/types';
import { memoryCache } from './cache.service';

export class YouTubeService {
  private parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    removeNSPrefix: true,
  });

  private parseRss(xmlText: string, limit = 6): VideoItem[] {
    const videos: VideoItem[] = [];
    try {
      const parsed = this.parser.parse(xmlText);
      const feed = parsed.feed;
      if (!feed || !feed.entry) return [];

      const entries = Array.isArray(feed.entry) ? feed.entry : [feed.entry];

      for (const entry of entries.slice(0, limit)) {
        const vidId = entry.videoId ? String(entry.videoId).trim() : '';
        if (!vidId) continue;

        const title = entry.title ? String(entry.title).trim() : 'Culto IASD Mangueiras';
        const pubAt = entry.published ? String(entry.published).trim() : '';
        
        let desc = '';
        let thumbUrl = `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`;

        if (entry.group) {
          if (entry.group.description) {
            desc = String(entry.group.description).trim();
          }
          if (entry.group.thumbnail && entry.group.thumbnail['@_url']) {
            thumbUrl = entry.group.thumbnail['@_url'];
          }
        }

        videos.push({
          id: vidId,
          title,
          description: desc,
          thumbnail_url: thumbUrl,
          published_at: pubAt,
          video_url: `https://www.youtube.com/watch?v=${vidId}`,
        });
      }
    } catch {
      // Retorna o que conseguiu parsear
    }
    return videos;
  }

  async fetchPlaylistDynamic(playlistId: string, limit = 12): Promise<VideoItem[]> {
    if (!playlistId) return [];

    // 1. Tenta API v3 com paginação completa para capturar todos os itens e ordenar do mais recente ao mais antigo
    if (config.youtube.apiKey) {
      try {
        let pageToken = '';
        const allVids: VideoItem[] = [];
        let pageCount = 0;

        do {
          const url = `https://www.googleapis.com/youtube/v3/playlistItems?key=${config.youtube.apiKey}&playlistId=${playlistId}&part=snippet&maxResults=50${pageToken ? '&pageToken=' + pageToken : ''}`;
          const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
          if (!res.ok) break;

          const data = (await res.json()) as any;
          for (const item of data.items || []) {
            const snippet = item.snippet || {};
            const vidId =
              snippet.resourceId?.videoId ||
              item.id?.videoId ||
              (typeof item.id === 'string' ? item.id : '');
            const thumbnails = snippet.thumbnails || {};
            const thumbUrl =
              thumbnails.high?.url ||
              thumbnails.medium?.url ||
              thumbnails.default?.url ||
              `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`;

            if (vidId && snippet.title !== 'Private video' && snippet.title !== 'Deleted video') {
              allVids.push({
                id: vidId,
                title: snippet.title || 'Transmissão IASD Mangueiras',
                description: snippet.description || '',
                thumbnail_url: thumbUrl,
                published_at: snippet.publishedAt || '',
                video_url: `https://www.youtube.com/watch?v=${vidId}`,
              });
            }
          }

          pageToken = data.nextPageToken || '';
          pageCount++;
        } while (pageToken && pageCount < 5); // Limita a 5 páginas (250 vídeos) por segurança

        if (allVids.length > 0) {
          // Ordena rigorosamente do mais recente para o mais antigo por data de publicação
          allVids.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
          return allVids.slice(0, limit);
        }
      } catch {
        // Fallback para RSS
      }
    }

    // 2. Fallback RSS Público oficial do YouTube (Sem chave de API)
    try {
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
      const res = await fetch(rssUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IASD-Mangueiras-Bot/1.0)' },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const xmlText = await res.text();
        const rssVideos = this.parseRss(xmlText, limit);
        if (rssVideos.length > 0) {
          rssVideos.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
          return rssVideos;
        }
      }
    } catch {
      // Ignora erro
    }

    return [];
  }

  async fetchChannelDynamic(limit = 8): Promise<VideoItem[]> {
    if (config.youtube.apiKey && config.youtube.channelId) {
      try {
        const url = `https://www.googleapis.com/youtube/v3/search?key=${config.youtube.apiKey}&channelId=${config.youtube.channelId}&part=snippet,id&order=date&maxResults=${limit}&type=video`;
        const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const data = (await res.json()) as any;
          const vids: VideoItem[] = [];
          for (const item of data.items || []) {
            const vidId = item.id?.videoId || '';
            const snippet = item.snippet || {};
            if (vidId) {
              vids.push({
                id: vidId,
                title: snippet.title || 'Transmissão IASD Mangueiras',
                description: snippet.description || '',
                thumbnail_url: snippet.thumbnails?.high?.url || `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`,
                published_at: snippet.publishedAt || '',
                video_url: `https://www.youtube.com/watch?v=${vidId}`,
              });
            }
          }
          if (vids.length > 0) return vids;
        }
      } catch {
        // Fallback para RSS
      }
    }

    if (config.youtube.channelId) {
      try {
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${config.youtube.channelId}`;
        const res = await fetch(rssUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; IASD-Mangueiras-Bot/1.0)' },
          signal: AbortSignal.timeout(5000),
        });
        if (res.ok) {
          const xmlText = await res.text();
          const rssVideos = this.parseRss(xmlText, limit);
          if (rssVideos.length > 0) return rssVideos;
        }
      } catch {
        // Ignora erro
      }
    }

    return [];
  }

  async getPlaylistVideos(category: string, limit = 6): Promise<YouTubeLatestResponse> {
    const playlistIds: Record<string, string> = {
      presente7: config.youtube.playlists.presente7,
      sabado: config.youtube.playlists.sabado,
      domingo: config.youtube.playlists.domingo,
      quarta: config.youtube.playlists.quarta,
    };

    const playlistId = playlistIds[category] || '';
    const cacheKey = `yt_pl_${category}_${playlistId}`;
    const cached = memoryCache.get<YouTubeLatestResponse>(cacheKey);
    if (cached) return cached;

    const vids = await this.fetchPlaylistDynamic(playlistId, limit);
    const response: YouTubeLatestResponse = {
      channel_id: config.youtube.channelId,
      videos: vids,
    };

    if (vids.length > 0) {
      memoryCache.set(cacheKey, response, config.youtube.cacheTtlSeconds);
    }
    return response;
  }

  async getLatestVideos(): Promise<YouTubeLatestResponse> {
    const cacheKey = `yt_catalog_all_${config.youtube.channelId}`;
    const cached = memoryCache.get<YouTubeLatestResponse>(cacheKey);
    if (cached) return cached;

    const [channel, presente7, sabado, domingo, quarta] = await Promise.all([
      this.fetchChannelDynamic(15),
      this.fetchPlaylistDynamic(config.youtube.playlists.presente7, 10),
      this.fetchPlaylistDynamic(config.youtube.playlists.sabado, 6),
      this.fetchPlaylistDynamic(config.youtube.playlists.domingo, 6),
      this.fetchPlaylistDynamic(config.youtube.playlists.quarta, 6),
    ]);

    const mergedMap = new Map<string, VideoItem>();
    const allResults = [...channel, ...presente7, ...sabado, ...domingo, ...quarta];

    for (const item of allResults) {
      if (item.id && !mergedMap.has(item.id)) {
        mergedMap.set(item.id, item);
      }
    }

    const videoList = Array.from(mergedMap.values());
    videoList.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

    const response: YouTubeLatestResponse = {
      channel_id: config.youtube.channelId,
      videos: videoList,
    };

    if (videoList.length > 0) {
      memoryCache.set(cacheKey, response, config.youtube.cacheTtlSeconds);
    }
    return response;
  }

  async getLiveStatus(): Promise<YouTubeLiveResponse> {
    const cacheKey = `yt_live_${config.youtube.channelId}`;
    const cached = memoryCache.get<YouTubeLiveResponse>(cacheKey);
    if (cached) return cached;

    if (!config.youtube.apiKey) {
      const res: YouTubeLiveResponse = { is_live: false, live_video: null };
      memoryCache.set(cacheKey, res, 300);
      return res;
    }

    try {
      const url = `https://www.googleapis.com/youtube/v3/search?key=${config.youtube.apiKey}&channelId=${config.youtube.channelId}&part=snippet,id&eventType=live&type=video`;
      const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (response.ok) {
        const data = (await response.json()) as any;
        const items = data.items || [];
        if (items.length > 0) {
          const item = items[0];
          const vidId = item.id?.videoId || '';
          const snippet = item.snippet || {};
          const liveVid: VideoItem = {
            id: vidId,
            title: snippet.title || 'Culto Ao Vivo',
            description: snippet.description || '',
            thumbnail_url: snippet.thumbnails?.high?.url || `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`,
            published_at: snippet.publishedAt || '',
            video_url: `https://www.youtube.com/watch?v=${vidId}`,
          };
          const res: YouTubeLiveResponse = { is_live: true, live_video: liveVid };
          memoryCache.set(cacheKey, res, 300);
          return res;
        }
      }
    } catch {
      // Ignora erro
    }

    const fallbackRes: YouTubeLiveResponse = { is_live: false, live_video: null };
    memoryCache.set(cacheKey, fallbackRes, 300);
    return fallbackRes;
  }
}

export const youtubeService = new YouTubeService();
