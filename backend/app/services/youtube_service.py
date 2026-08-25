import asyncio
import defusedxml.ElementTree as ET
import httpx
from app.core.cache import cache
from app.core.config import settings
from app.models.youtube import VideoItem, YouTubeLatestResponse, YouTubeLiveResponse

ATOM_NS = {
    "atom": "http://www.w3.org/2005/Atom",
    "yt": "http://www.youtube.com/xml/schemas/2015",
    "media": "http://search.yahoo.com/mrss/",
}


def parse_youtube_rss(xml_text: str, limit: int = 6) -> list[VideoItem]:
    videos: list[VideoItem] = []
    try:
        root = ET.fromstring(xml_text)
        entries = root.findall("atom:entry", ATOM_NS)
        for entry in entries[:limit]:
            vid_elem = entry.find("yt:videoId", ATOM_NS)
            vid_id = vid_elem.text.strip() if vid_elem is not None and vid_elem.text else ""
            if not vid_id:
                continue

            title_elem = entry.find("atom:title", ATOM_NS)
            title = (
                title_elem.text.strip()
                if title_elem is not None and title_elem.text
                else "Culto IASD Mangueiras"
            )

            pub_elem = entry.find("atom:published", ATOM_NS)
            pub_at = pub_elem.text.strip() if pub_elem is not None and pub_elem.text else ""

            media_group = entry.find("media:group", ATOM_NS)
            desc = ""
            thumb_url = f"https://i.ytimg.com/vi/{vid_id}/hqdefault.jpg"

            if media_group is not None:
                desc_elem = media_group.find("media:description", ATOM_NS)
                if desc_elem is not None and desc_elem.text:
                    desc = desc_elem.text.strip()
                thumb_elem = media_group.find("media:thumbnail", ATOM_NS)
                if thumb_elem is not None:
                    custom_thumb = thumb_elem.attrib.get("url")
                    if custom_thumb:
                        thumb_url = custom_thumb

            videos.append(
                VideoItem(
                    id=vid_id,
                    title=title,
                    description=desc,
                    thumbnail_url=thumb_url,
                    published_at=pub_at,
                    video_url=f"https://www.youtube.com/watch?v={vid_id}",
                )
            )
    except Exception:
        pass
    return videos


class YouTubeService:
    async def fetch_playlist_dynamic(self, playlist_id: str, limit: int = 6) -> list[VideoItem]:
        if not playlist_id:
            return []

        # 1. Tenta API v3 se houver chave configurada
        if settings.youtube_api_key:
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    url = (
                        "https://www.googleapis.com/youtube/v3/playlistItems"
                        f"?key={settings.youtube_api_key}"
                        f"&playlistId={playlist_id}"
                        f"&part=snippet&maxResults={limit}"
                    )
                    response = await client.get(url)
                    if response.status_code == 200:
                        data = response.json()
                        vids: list[VideoItem] = []
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
                                vids.append(
                                    VideoItem(
                                        id=vid_id,
                                        title=snippet.get("title", "Transmissão IASD Mangueiras"),
                                        description=snippet.get("description", ""),
                                        thumbnail_url=thumb_url,
                                        published_at=snippet.get("publishedAt", ""),
                                        video_url=f"https://www.youtube.com/watch?v={vid_id}",
                                    )
                                )
                        if vids:
                            return vids
            except Exception:
                pass

        # 2. Tenta feed RSS público oficial do YouTube (Sem necessidade de chave de API)
        try:
            async with httpx.AsyncClient(
                timeout=5.0,
                headers={"User-Agent": "Mozilla/5.0 (compatible; IASD-Mangueiras-Bot/1.0)"},
            ) as client:
                rss_url = f"https://www.youtube.com/feeds/videos.xml?playlist_id={playlist_id}"
                response = await client.get(rss_url)
                if response.status_code == 200:
                    rss_videos = parse_youtube_rss(response.text, limit=limit)
                    if rss_videos:
                        return rss_videos
        except Exception:
            pass

        return []

    async def fetch_channel_dynamic(self, limit: int = 8) -> list[VideoItem]:
        # 1. API v3
        if settings.youtube_api_key and settings.youtube_channel_id:
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    url = (
                        "https://www.googleapis.com/youtube/v3/search"
                        f"?key={settings.youtube_api_key}"
                        f"&channelId={settings.youtube_channel_id}"
                        f"&part=snippet,id&order=date&maxResults={limit}&type=video"
                    )
                    response = await client.get(url)
                    if response.status_code == 200:
                        data = response.json()
                        vids: list[VideoItem] = []
                        for item in data.get("items", []):
                            vid_id = item.get("id", {}).get("videoId", "")
                            snippet = item.get("snippet", {})
                            if vid_id:
                                vids.append(
                                    VideoItem(
                                        id=vid_id,
                                        title=snippet.get("title", "Transmissão IASD Mangueiras"),
                                        description=snippet.get("description", ""),
                                        thumbnail_url=snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
                                        published_at=snippet.get("publishedAt", ""),
                                        video_url=f"https://www.youtube.com/watch?v={vid_id}",
                                    )
                                )
                        if vids:
                            return vids
            except Exception:
                pass

        # 2. RSS Feed público do canal
        if settings.youtube_channel_id:
            try:
                async with httpx.AsyncClient(
                    timeout=5.0,
                    headers={"User-Agent": "Mozilla/5.0 (compatible; IASD-Mangueiras-Bot/1.0)"},
                ) as client:
                    rss_url = f"https://www.youtube.com/feeds/videos.xml?channel_id={settings.youtube_channel_id}"
                    response = await client.get(rss_url)
                    if response.status_code == 200:
                        rss_videos = parse_youtube_rss(response.text, limit=limit)
                        if rss_videos:
                            return rss_videos
            except Exception:
                pass

        return []

    async def get_playlist_videos(self, category: str, limit: int = 6) -> YouTubeLatestResponse:
        playlist_ids = {
            "presente7": settings.youtube_presente7_playlist_id,
            "sabado": settings.youtube_sabado_playlist_id,
            "domingo": settings.youtube_domingo_playlist_id,
            "quarta": settings.youtube_quarta_playlist_id,
        }
        playlist_id = playlist_ids.get(category, "")
        cache_key = f"yt_pl_{category}_{playlist_id}"
        cached = cache.get(cache_key)
        if cached:
            return YouTubeLatestResponse(**cached)

        vids = await self.fetch_playlist_dynamic(playlist_id, limit=limit)

        res = YouTubeLatestResponse(
            channel_id=settings.youtube_channel_id,
            videos=vids,
        )
        if vids:
            cache.set(cache_key, res.model_dump(), settings.youtube_cache_ttl_seconds)
        return res

    async def get_latest_videos(self) -> YouTubeLatestResponse:
        cache_key = f"yt_catalog_all_{settings.youtube_channel_id}"
        cached = cache.get(cache_key)
        if cached:
            return YouTubeLatestResponse(**cached)

        # Busca em paralelo as 4 playlists oficiais (Sábado, Domingo, Quarta e Presente 7) e os vídeos do canal
        tasks = [
            self.fetch_playlist_dynamic(settings.youtube_sabado_playlist_id, limit=6),
            self.fetch_playlist_dynamic(settings.youtube_domingo_playlist_id, limit=6),
            self.fetch_playlist_dynamic(settings.youtube_quarta_playlist_id, limit=6),
            self.fetch_playlist_dynamic(settings.youtube_presente7_playlist_id, limit=6),
            self.fetch_channel_dynamic(limit=6),
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        merged_map: dict[str, VideoItem] = {}
        for res in results:
            if isinstance(res, list):
                for item in res:
                    if item.id and item.id not in merged_map:
                        merged_map[item.id] = item

        # Ordena estritamente em ordem decrescente de data
        video_list = list(merged_map.values())
        video_list.sort(key=lambda x: x.published_at, reverse=True)

        response = YouTubeLatestResponse(
            channel_id=settings.youtube_channel_id,
            videos=video_list,
        )
        if video_list:
            cache.set(cache_key, response.model_dump(), settings.youtube_cache_ttl_seconds)
        return response

    async def get_presente7_videos(self) -> YouTubeLatestResponse:
        return await self.get_playlist_videos("presente7", limit=6)

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
