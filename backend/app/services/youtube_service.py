import httpx
from app.core.cache import cache
from app.core.config import settings
from app.models.youtube import VideoItem, YouTubeLatestResponse, YouTubeLiveResponse

FALLBACK_VIDEOS = [
    # Cultos de Domingo (Mais recente primeiro)
    VideoItem(
        id="Gk7BusYGpVg",
        title="A Imortalidade da Alma — Ademir Mendes | Culto de Domingo",
        description="Culto evangelístico e estudo das verdades bíblicas na IASD Mangueiras.",
        thumbnail_url="https://i.ytimg.com/vi/Gk7BusYGpVg/hqdefault.jpg",
        published_at="2026-08-23T19:30:00Z",
        video_url="https://www.youtube.com/watch?v=Gk7BusYGpVg",
    ),
    # Cultos de Sábado
    VideoItem(
        id="QpQF6hCmAw8",
        title="Saudade! - Parte 1 | Culto de Sábado",
        description="Culto de adoração e mensagem bíblica na IASD Mangueiras em Tatuí-SP.",
        thumbnail_url="https://i.ytimg.com/vi/QpQF6hCmAw8/hqdefault.jpg",
        published_at="2026-08-22T10:15:00Z",
        video_url="https://www.youtube.com/watch?v=QpQF6hCmAw8",
    ),
    # Cultos de Quarta
    VideoItem(
        id="v5On3uvpMe0",
        title="Servir — Josy Monteiro Cesar | Culto de Quarta",
        description="Culto de oração e testemunho no meio de semana na IASD Mangueiras.",
        thumbnail_url="https://i.ytimg.com/vi/v5On3uvpMe0/hqdefault.jpg",
        published_at="2026-08-19T19:30:00Z",
        video_url="https://www.youtube.com/watch?v=v5On3uvpMe0",
    ),
    # Domingo
    VideoItem(
        id="2dX9krpFi_Q",
        title="O Ritual do Santuário Terrestre — Maurício Braga | Culto de Domingo",
        description="Estudo bíblico e mensagem para a família sobre o plano da salvação.",
        thumbnail_url="https://i.ytimg.com/vi/2dX9krpFi_Q/hqdefault.jpg",
        published_at="2026-08-16T19:30:00Z",
        video_url="https://www.youtube.com/watch?v=2dX9krpFi_Q",
    ),
    # Sábado
    VideoItem(
        id="7b7_ptk4gAY",
        title="Saudade! - Parte 2 | Culto de Sábado",
        description="Culto de adoração e reflexão espiritual na IASD Mangueiras em Tatuí-SP.",
        thumbnail_url="https://i.ytimg.com/vi/7b7_ptk4gAY/hqdefault.jpg",
        published_at="2026-08-15T10:15:00Z",
        video_url="https://www.youtube.com/watch?v=7b7_ptk4gAY",
    ),
    # Quarta
    VideoItem(
        id="yvZpOUvFffU",
        title="Segurança Financeira da Família — Uilson Garcia | Culto de Quarta",
        description="Estudo bíblico prático sobre mordomia cristã e princípios financeiros.",
        thumbnail_url="https://i.ytimg.com/vi/yvZpOUvFffU/hqdefault.jpg",
        published_at="2026-08-12T19:30:00Z",
        video_url="https://www.youtube.com/watch?v=yvZpOUvFffU",
    ),
    # Domingo
    VideoItem(
        id="_Spz3atblk4",
        title="Por que Devo Ser Grato? | Culto da Família",
        description="Culto de domingo com louvor, gratidão e reflexão para o lar.",
        thumbnail_url="https://i.ytimg.com/vi/_Spz3atblk4/hqdefault.jpg",
        published_at="2026-08-09T19:30:00Z",
        video_url="https://www.youtube.com/watch?v=_Spz3atblk4",
    ),
    # Sábado
    VideoItem(
        id="dxDPQIeWfAQ",
        title="Dilemas — Pr. Geraldo Beulke Jr. | Culto de Sábado",
        description="Mensagem inspiradora sobre escolhas e compromisso cristão na IASD Mangueiras.",
        thumbnail_url="https://i.ytimg.com/vi/dxDPQIeWfAQ/hqdefault.jpg",
        published_at="2026-08-08T10:15:00Z",
        video_url="https://www.youtube.com/watch?v=dxDPQIeWfAQ",
    ),
    # Quarta
    VideoItem(
        id="AK7HEraJ2Y4",
        title="Elias 3.1 — José Newton | Culto de Oração",
        description="Mensagem bíblica inspiradora e momentos de intercessão coletiva.",
        thumbnail_url="https://i.ytimg.com/vi/AK7HEraJ2Y4/hqdefault.jpg",
        published_at="2026-08-05T19:30:00Z",
        video_url="https://www.youtube.com/watch?v=AK7HEraJ2Y4",
    ),
    # Domingo
    VideoItem(
        id="scpV00KOxgw",
        title="Marcados para Cristo — Thiago Gaya | Culto de Domingo",
        description="Mensagem edificante sobre identidade cristã e entrega a Jesus.",
        thumbnail_url="https://i.ytimg.com/vi/scpV00KOxgw/hqdefault.jpg",
        published_at="2026-08-02T19:30:00Z",
        video_url="https://www.youtube.com/watch?v=scpV00KOxgw",
    ),
    # Sábado
    VideoItem(
        id="c88PnTRA9QA",
        title="A Essência do Cristão | Culto de Adoração",
        description="Culto divino e mensagem edificante sobre o testemunho e caráter cristão.",
        thumbnail_url="https://i.ytimg.com/vi/c88PnTRA9QA/hqdefault.jpg",
        published_at="2026-08-01T10:15:00Z",
        video_url="https://www.youtube.com/watch?v=c88PnTRA9QA",
    ),
    # Quarta
    VideoItem(
        id="b_56pMDeYiQ",
        title="Jesus, o Caminho — João Carlos Pereira | Culto de Quarta",
        description="Estudo das Escrituras e oração intercessória na igreja local.",
        thumbnail_url="https://i.ytimg.com/vi/b_56pMDeYiQ/hqdefault.jpg",
        published_at="2026-07-29T19:30:00Z",
        video_url="https://www.youtube.com/watch?v=b_56pMDeYiQ",
    ),
    # Domingo
    VideoItem(
        id="qT1XpQpntxo",
        title="Deus Está no Controle — Eduardo Rueda | Culto de Domingo",
        description="Estudo sobre fé, segurança e esperança nas promessas divinas.",
        thumbnail_url="https://i.ytimg.com/vi/qT1XpQpntxo/hqdefault.jpg",
        published_at="2026-07-26T19:30:00Z",
        video_url="https://www.youtube.com/watch?v=qT1XpQpntxo",
    ),
    # Sábado
    VideoItem(
        id="7nL32K6DPhg",
        title="Haja Luz! | Culto de Sábado",
        description="Transmissão do culto de adoração com louvores e reflexão bíblica.",
        thumbnail_url="https://i.ytimg.com/vi/7nL32K6DPhg/hqdefault.jpg",
        published_at="2026-07-25T10:15:00Z",
        video_url="https://www.youtube.com/watch?v=7nL32K6DPhg",
    ),
    # Quarta
    VideoItem(
        id="SdTUjLTJLAM",
        title="O Deus que Cuida — Sílvia Colasso | Culto de Quarta",
        description="Testemunhos de fé e mensagem sobre o cuidado de Deus no cotidiano.",
        thumbnail_url="https://i.ytimg.com/vi/SdTUjLTJLAM/hqdefault.jpg",
        published_at="2026-07-22T19:30:00Z",
        video_url="https://www.youtube.com/watch?v=SdTUjLTJLAM",
    ),
    # Domingo
    VideoItem(
        id="O9MgNO_beCs",
        title="Oração: A Arma Mais Poderosa da Terra — Osni Hessel | Culto de Domingo",
        description="Mensagem especial sobre o poder da oração e comunhão com Deus.",
        thumbnail_url="https://i.ytimg.com/vi/O9MgNO_beCs/hqdefault.jpg",
        published_at="2026-07-19T19:30:00Z",
        video_url="https://www.youtube.com/watch?v=O9MgNO_beCs",
    ),
    # Sábado
    VideoItem(
        id="Gvhydxi0AVE",
        title="Viva Seus Sonhos | Culto de Sábado",
        description="Mensagem especial sobre propósitos de vida e confiança em Deus.",
        thumbnail_url="https://i.ytimg.com/vi/Gvhydxi0AVE/hqdefault.jpg",
        published_at="2026-07-18T10:15:00Z",
        video_url="https://www.youtube.com/watch?v=Gvhydxi0AVE",
    ),
    # Quarta
    VideoItem(
        id="7a1R8KHAgj0",
        title="O Semeador e a Semente — Marcos Cavalcante | Culto de Quarta",
        description="Parábolas de Jesus e aplicação prática para o discipulado.",
        thumbnail_url="https://i.ytimg.com/vi/7a1R8KHAgj0/hqdefault.jpg",
        published_at="2026-07-15T19:30:00Z",
        video_url="https://www.youtube.com/watch?v=7a1R8KHAgj0",
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
        if not vids:
            if category == "presente7":
                vids = FALLBACK_PRESENTE7_VIDEOS[:limit]
            else:
                vids = [v for v in FALLBACK_VIDEOS if category in v.title.lower()][:limit]
                if not vids:
                    vids = FALLBACK_VIDEOS[:limit]

        res = YouTubeLatestResponse(
            channel_id=settings.youtube_channel_id,
            videos=vids,
        )
        cache.set(cache_key, res.model_dump(), settings.youtube_cache_ttl_seconds)
        return res

    async def get_latest_videos(self) -> YouTubeLatestResponse:
        cache_key = f"yt_catalog_all_{settings.youtube_channel_id}"
        cached = cache.get(cache_key)
        if cached:
            return YouTubeLatestResponse(**cached)

        # Busca em paralelo as 4 playlists oficiais (Sábado, Domingo, Quarta e Presente 7)
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

        # Se não encontrou nenhum por rede, usa fallback completo
        if not merged_map:
            for item in FALLBACK_VIDEOS:
                merged_map[item.id] = item
            for item in FALLBACK_PRESENTE7_VIDEOS:
                if item.id not in merged_map:
                    merged_map[item.id] = item

        # Ordena estritamente em ordem decrescente de data
        video_list = list(merged_map.values())
        video_list.sort(key=lambda x: x.published_at, reverse=True)

        response = YouTubeLatestResponse(
            channel_id=settings.youtube_channel_id,
            videos=video_list,
        )
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
