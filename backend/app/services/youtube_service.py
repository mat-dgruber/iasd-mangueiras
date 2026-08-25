import httpx
from app.core.cache import cache
from app.core.config import settings
from app.models.youtube import VideoItem, YouTubeLatestResponse, YouTubeLiveResponse

FALLBACK_VIDEOS = [
    VideoItem(
        id="YyFgCdgq_So",
        title="Uma Nova Identidade — Série Identidade | Pr. Osmar Borges",
        description="Transmissão ao vivo do culto de adoração da IASD Mangueiras em Tatuí-SP.",
        thumbnail_url="https://i.ytimg.com/vi/YyFgCdgq_So/hqdefault.jpg",
        published_at="2026-08-24T11:48:40Z",
        video_url="https://www.youtube.com/watch?v=YyFgCdgq_So",
    ),
    VideoItem(
        id="EWYzMii3Jj4",
        title="Filho da Escrava ou da Livre? | Pr. Paulo Pinheiro",
        description="Culto de adoração e mensagem bíblica na IASD Mangueiras em Tatuí-SP.",
        thumbnail_url="https://i.ytimg.com/vi/EWYzMii3Jj4/hqdefault.jpg",
        published_at="2026-08-23T02:57:44Z",
        video_url="https://www.youtube.com/watch?v=EWYzMii3Jj4",
    ),
    VideoItem(
        id="oarhiElXlSk",
        title="A Plenitude do Tempo | Pr. Gabriel Pilon",
        description="Mensagem inspiradora e estudo da palavra de Deus na IASD Mangueiras.",
        thumbnail_url="https://i.ytimg.com/vi/oarhiElXlSk/hqdefault.jpg",
        published_at="2026-08-17T11:25:59Z",
        video_url="https://www.youtube.com/watch?v=oarhiElXlSk",
    ),
    VideoItem(
        id="o3aiUSbprt8",
        title="Culto de Sábado: Vasilhas Vazias | Pr. Osmar Borges",
        description="Mensagem sobre fé, entrega e milagres na vida diária.",
        thumbnail_url="https://i.ytimg.com/vi/o3aiUSbprt8/hqdefault.jpg",
        published_at="2026-08-02T03:10:18Z",
        video_url="https://www.youtube.com/watch?v=o3aiUSbprt8",
    ),
]

FALLBACK_PRESENTE7_VIDEOS = [
    VideoItem(
        id="YyFgCdgq_So",
        title="Série Presente 7 — Lição da Semana | Pr. Michelson Borges & Pr. Osmar Borges",
        description="Estudo bíblico e reflexão da série Presente 7 gravada na IASD Mangueiras em Tatuí-SP.",
        thumbnail_url="https://i.ytimg.com/vi/YyFgCdgq_So/hqdefault.jpg",
        published_at="2026-08-22T12:00:00Z",
        video_url="https://www.youtube.com/watch?v=YyFgCdgq_So",
    ),
    VideoItem(
        id="EWYzMii3Jj4",
        title="Série Presente 7 — Princípios e Fundamentos da Fé | Pr. Osmar Borges",
        description="Comentários inspiradores e aplicação prática das Escrituras Sagradas para a vida diária.",
        thumbnail_url="https://i.ytimg.com/vi/EWYzMii3Jj4/hqdefault.jpg",
        published_at="2026-08-15T12:00:00Z",
        video_url="https://www.youtube.com/watch?v=EWYzMii3Jj4",
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

    async def get_presente7_videos(self) -> YouTubeLatestResponse:
        cache_key = f"yt_presente7_{settings.youtube_channel_id}"
        cached = cache.get(cache_key)
        if cached:
            return YouTubeLatestResponse(**cached)

        if not settings.youtube_api_key:
            res = YouTubeLatestResponse(
                channel_id=settings.youtube_channel_id,
                videos=FALLBACK_PRESENTE7_VIDEOS,
            )
            cache.set(cache_key, res.model_dump(), settings.youtube_cache_ttl_seconds)
            return res

        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                url = (
                    "https://www.googleapis.com/youtube/v3/search"
                    f"?key={settings.youtube_api_key}"
                    f"&channelId={settings.youtube_channel_id}"
                    "&part=snippet,id&order=date&q=Presente%207&maxResults=2&type=video"
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
                                    title=snippet.get("title", "Série Presente 7 — IASD Mangueiras"),
                                    description=snippet.get("description", ""),
                                    thumbnail_url=snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
                                    published_at=snippet.get("publishedAt", ""),
                                    video_url=f"https://www.youtube.com/watch?v={vid_id}",
                                )
                            )
                    res = YouTubeLatestResponse(
                        channel_id=settings.youtube_channel_id,
                        videos=videos if videos else FALLBACK_PRESENTE7_VIDEOS,
                    )
                    cache.set(cache_key, res.model_dump(), settings.youtube_cache_ttl_seconds)
                    return res
        except Exception:
            pass

        res = YouTubeLatestResponse(
            channel_id=settings.youtube_channel_id,
            videos=FALLBACK_PRESENTE7_VIDEOS,
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
