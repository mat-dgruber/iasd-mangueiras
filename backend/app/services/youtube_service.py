import httpx
from app.core.cache import cache
from app.core.config import settings
from app.models.youtube import VideoItem, YouTubeLatestResponse, YouTubeLiveResponse

FALLBACK_VIDEOS = [
    VideoItem(
        id="QpQF6hCmAw8",
        title="Saudade! - Parte 1 | Culto de Sábado",
        description="Culto de adoração e mensagem bíblica na IASD Mangueiras em Tatuí-SP.",
        thumbnail_url="https://i.ytimg.com/vi/QpQF6hCmAw8/hqdefault.jpg",
        published_at="2026-08-22T12:00:00Z",
        video_url="https://www.youtube.com/watch?v=QpQF6hCmAw8",
    ),
    VideoItem(
        id="Gk7BusYGpVg",
        title="A Imortalidade da Alma — Ademir Mendes | Culto de Domingo",
        description="Culto evangelístico e estudo das profecias bíblicas na IASD Mangueiras.",
        thumbnail_url="https://i.ytimg.com/vi/Gk7BusYGpVg/hqdefault.jpg",
        published_at="2026-08-16T22:30:00Z",
        video_url="https://www.youtube.com/watch?v=Gk7BusYGpVg",
    ),
    VideoItem(
        id="v5On3uvpMe0",
        title="Servir — Josy Monteiro Cesar | Culto de Quarta",
        description="Culto de oração e testemunho no meio de semana na IASD Mangueiras.",
        thumbnail_url="https://i.ytimg.com/vi/v5On3uvpMe0/hqdefault.jpg",
        published_at="2026-08-19T22:30:00Z",
        video_url="https://www.youtube.com/watch?v=v5On3uvpMe0",
    ),
    VideoItem(
        id="g_Xv8zP_Y1U",
        title="Lição 9 — Ministério Movido pelo Amor | Presente 7",
        description="Estudo bíblico e discussão da lição da Escola Sabatina na IASD Mangueiras.",
        thumbnail_url="https://i.ytimg.com/vi/g_Xv8zP_Y1U/hqdefault.jpg",
        published_at="2026-08-22T11:00:00Z",
        video_url="https://www.youtube.com/watch?v=g_Xv8zP_Y1U",
    ),
    VideoItem(
        id="dxDPQIeWfAQ",
        title="Dilemas — Pr. Geraldo Beulke Jr. | Culto de Sábado",
        description="Mensagem inspiradora sobre escolhas e compromisso cristão na IASD Mangueiras.",
        thumbnail_url="https://i.ytimg.com/vi/dxDPQIeWfAQ/hqdefault.jpg",
        published_at="2026-08-08T12:00:00Z",
        video_url="https://www.youtube.com/watch?v=dxDPQIeWfAQ",
    ),
    VideoItem(
        id="2dX9krpFi_Q",
        title="O Ritual do Santuário Terrestre — Maurício Braga | Culto de Domingo",
        description="Estudo bíblico sobre a tipologia do santuário e salvação na IASD Mangueiras.",
        thumbnail_url="https://i.ytimg.com/vi/2dX9krpFi_Q/hqdefault.jpg",
        published_at="2026-08-09T22:30:00Z",
        video_url="https://www.youtube.com/watch?v=2dX9krpFi_Q",
    ),
]

FALLBACK_PRESENTE7_VIDEOS = [
    VideoItem(
        id="g_Xv8zP_Y1U",
        title="Lição 9 — Ministério Movido pelo Amor | Presente 7",
        description="Estudo bíblico aprofundado e reflexão temática da série especial Presente 7 gravada na IASD Mangueiras em Tatuí-SP.",
        thumbnail_url="https://i.ytimg.com/vi/g_Xv8zP_Y1U/hqdefault.jpg",
        published_at="2026-08-22T11:00:00Z",
        video_url="https://www.youtube.com/watch?v=g_Xv8zP_Y1U",
    ),
    VideoItem(
        id="GYHNPDQTQcY",
        title="Lição 8 — O Poder da Ressurreição de Cristo | Presente 7",
        description="Comentários inspiradores e aplicação prática da lição da Escola Sabatina na IASD Mangueiras.",
        thumbnail_url="https://i.ytimg.com/vi/GYHNPDQTQcY/hqdefault.jpg",
        published_at="2026-08-15T11:00:00Z",
        video_url="https://www.youtube.com/watch?v=GYHNPDQTQcY",
    ),
    VideoItem(
        id="Vscv4l3V7kA",
        title="Lição 7 — O Retrato do Amor | Presente 7",
        description="Estudo dinâmico e edificante sobre as verdades bíblicas e a comunhão cristã.",
        thumbnail_url="https://i.ytimg.com/vi/Vscv4l3V7kA/hqdefault.jpg",
        published_at="2026-08-08T11:00:00Z",
        video_url="https://www.youtube.com/watch?v=Vscv4l3V7kA",
    ),
    VideoItem(
        id="OQxmwqEYJkM",
        title="Lição 6 — Dons Espirituais | Presente 7",
        description="Reflexão especial sobre dons espirituais e o propósito da igreja na vida diária.",
        thumbnail_url="https://i.ytimg.com/vi/OQxmwqEYJkM/hqdefault.jpg",
        published_at="2026-08-01T11:00:00Z",
        video_url="https://www.youtube.com/watch?v=OQxmwqEYJkM",
    ),
    VideoItem(
        id="KPNK-aTJMNg",
        title="Lição 5 — Tudo para a Glória de Deus | Presente 7",
        description="Comentários e reflexões sobre mordomia cristã e adoração bíblica.",
        thumbnail_url="https://i.ytimg.com/vi/KPNK-aTJMNg/hqdefault.jpg",
        published_at="2026-07-25T11:00:00Z",
        video_url="https://www.youtube.com/watch?v=KPNK-aTJMNg",
    ),
    VideoItem(
        id="jfDgjNtIL-Y",
        title="Lição 4 — Pecado na Igreja | Presente 7",
        description="Estudo da palavra de Deus e lições para o fortalecimento da comunidade cristã.",
        thumbnail_url="https://i.ytimg.com/vi/jfDgjNtIL-Y/hqdefault.jpg",
        published_at="2026-07-18T11:00:00Z",
        video_url="https://www.youtube.com/watch?v=jfDgjNtIL-Y",
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
                if settings.youtube_presente7_playlist_id:
                    url = (
                        "https://www.googleapis.com/youtube/v3/playlistItems"
                        f"?key={settings.youtube_api_key}"
                        f"&playlistId={settings.youtube_presente7_playlist_id}"
                        "&part=snippet&maxResults=8"
                    )
                else:
                    url = (
                        "https://www.googleapis.com/youtube/v3/search"
                        f"?key={settings.youtube_api_key}"
                        f"&channelId={settings.youtube_channel_id}"
                        "&part=snippet,id&order=date&q=Presente%207&maxResults=6&type=video"
                    )
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    videos: list[VideoItem] = []
                    for item in data.get("items", []):
                        snippet = item.get("snippet", {})
                        vid_id = (
                            snippet.get("resourceId", {}).get("videoId")
                            or item.get("id", {}).get("videoId")
                            or (item.get("id") if isinstance(item.get("id"), str) else "")
                        )
                        thumbnails = snippet.get("thumbnails", {})
                        thumb_url = (
                            thumbnails.get("high", {}).get("url")
                            or thumbnails.get("medium", {}).get("url")
                            or thumbnails.get("default", {}).get("url", "")
                        )
                        if vid_id:
                            videos.append(
                                VideoItem(
                                    id=vid_id,
                                    title=snippet.get("title", "Série Presente 7 — IASD Mangueiras"),
                                    description=snippet.get("description", ""),
                                    thumbnail_url=thumb_url,
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
