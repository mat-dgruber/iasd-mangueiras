import httpx
from app.core.cache import cache
from app.core.config import settings
from app.models.youtube import VideoItem, YouTubeLatestResponse, YouTubeLiveResponse

FALLBACK_VIDEOS = [
    VideoItem(
        id="live-fallback-01",
        title="Culto Divino — Esperança em Tempos Difíceis",
        description="Transmissão ao vivo do culto de adoração da IASD Mangueiras em Tatuí-SP.",
        thumbnail_url="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800&auto=format&fit=crop&q=80",
        published_at="2026-03-01T10:15:00Z",
        video_url="https://www.youtube.com/c/IASDMangueiras",
    ),
    VideoItem(
        id="p7-fallback-01",
        title="Série Presente 7 — Episódio 1: O Princípio da Criação",
        description="Estudo especial sobre as origens e a relevância do sábado para os dias atuais.",
        thumbnail_url="https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&auto=format&fit=crop&q=80",
        published_at="2026-02-20T19:30:00Z",
        video_url="https://www.youtube.com/c/IASDMangueiras",
    ),
    VideoItem(
        id="p7-fallback-02",
        title="Série Presente 7 — Episódio 2: Um Dia de Descanso e Cura",
        description="Como encontrar alívio da ansiedade e conexão familiar no dia do Senhor.",
        thumbnail_url="https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&auto=format&fit=crop&q=80",
        published_at="2026-02-27T19:30:00Z",
        video_url="https://www.youtube.com/c/IASDMangueiras",
    ),
]


class YouTubeService:
    async def get_latest_videos(self) -> YouTubeLatestResponse:
        cache_key = f"yt_latest_{settings.youtube_channel_id}"
        cached = cache.get(cache_key)
        if cached:
            return YouTubeLatestResponse(**cached)

        if not settings.youtube_api_key:
            res = YouTubeLatestResponse(
                channel_id=settings.youtube_channel_id,
                videos=FALLBACK_VIDEOS,
            )
            cache.set(cache_key, res.model_dump(), settings.youtube_cache_ttl_seconds)
            return res

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                url = (
                    "https://www.googleapis.com/youtube/v3/search"
                    f"?key={settings.youtube_api_key}"
                    f"&channelId={settings.youtube_channel_id}"
                    "&part=snippet,id&order=date&maxResults=6&type=video"
                )
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    videos: list[VideoItem] = []
                    for item in data.get("items", []):
                        vid_id = item.get("id", {}).get("videoId", "")
                        snippet = item.get("snippet", {})
                        if vid_id:
                            videos.append(
                                VideoItem(
                                    id=vid_id,
                                    title=snippet.get("title", "Transmissão IASD Mangueiras"),
                                    description=snippet.get("description", ""),
                                    thumbnail_url=snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
                                    published_at=snippet.get("publishedAt", ""),
                                    video_url=f"https://www.youtube.com/watch?v={vid_id}",
                                )
                            )
                    res = YouTubeLatestResponse(
                        channel_id=settings.youtube_channel_id,
                        videos=videos if videos else FALLBACK_VIDEOS,
                    )
                    cache.set(cache_key, res.model_dump(), settings.youtube_cache_ttl_seconds)
                    return res
        except Exception:
            pass

        # Fallback se falhar
        res = YouTubeLatestResponse(
            channel_id=settings.youtube_channel_id,
            videos=FALLBACK_VIDEOS,
        )
        cache.set(cache_key, res.model_dump(), settings.youtube_cache_ttl_seconds)
        return res

    async def get_live_status(self) -> YouTubeLiveResponse:
        cache_key = f"yt_live_{settings.youtube_channel_id}"
        cached = cache.get(cache_key)
        if cached:
            return YouTubeLiveResponse(**cached)

        if not settings.youtube_api_key:
            res = YouTubeLiveResponse(is_live=False, live_video=None)
            cache.set(cache_key, res.model_dump(), 300)  # 5 min para live
            return res

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                url = (
                    "https://www.googleapis.com/youtube/v3/search"
                    f"?key={settings.youtube_api_key}"
                    f"&channelId={settings.youtube_channel_id}"
                    "&part=snippet,id&eventType=live&type=video"
                )
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    items = data.get("items", [])
                    if items:
                        item = items[0]
                        vid_id = item.get("id", {}).get("videoId", "")
                        snippet = item.get("snippet", {})
                        live_vid = VideoItem(
                            id=vid_id,
                            title=snippet.get("title", "Culto Ao Vivo"),
                            description=snippet.get("description", ""),
                            thumbnail_url=snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
                            published_at=snippet.get("publishedAt", ""),
                            video_url=f"https://www.youtube.com/watch?v={vid_id}",
                        )
                        res = YouTubeLiveResponse(is_live=True, live_video=live_vid)
                        cache.set(cache_key, res.model_dump(), 300)
                        return res
        except Exception:
            pass

        res = YouTubeLiveResponse(is_live=False, live_video=None)
        cache.set(cache_key, res.model_dump(), 300)
        return res


youtube_service = YouTubeService()
