import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app


@pytest.mark.anyio
async def test_health_check() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


@pytest.mark.anyio
async def test_get_latest_videos() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/youtube/latest")
        assert response.status_code == 200
        data = response.json()
        assert "videos" in data
        assert len(data["videos"]) > 0
        for video in data["videos"]:
            assert "id" in video and bool(video["id"])
            assert "title" in video and bool(video["title"])
            assert "thumbnail_url" in video and bool(video["thumbnail_url"])
            assert "published_at" in video and bool(video["published_at"])
            assert "video_url" in video and bool(video["video_url"])


@pytest.mark.anyio
async def test_get_presente7_videos() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/youtube/presente7")
        assert response.status_code == 200
        data = response.json()
        assert "videos" in data
        assert len(data["videos"]) >= 2
        for video in data["videos"]:
            assert "id" in video and bool(video["id"])
            assert "title" in video and bool(video["title"])
            assert "thumbnail_url" in video and bool(video["thumbnail_url"])
            assert "published_at" in video and bool(video["published_at"])
            assert "video_url" in video and bool(video["video_url"])


@pytest.mark.anyio
async def test_get_catalog_and_playlist_routes() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Test catalog
        catalog_res = await client.get("/api/youtube/catalog")
        assert catalog_res.status_code == 200
        cat_data = catalog_res.json()
        assert "videos" in cat_data
        assert len(cat_data["videos"]) > 0

        # Test playlist por categoria
        for cat in ["sabado", "domingo", "quarta", "presente7"]:
            pl_res = await client.get(f"/api/youtube/playlist/{cat}")
            assert pl_res.status_code == 200
            pl_data = pl_res.json()
            assert "videos" in pl_data
            assert len(pl_data["videos"]) > 0


@pytest.mark.anyio
async def test_get_live_status() -> None:
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/youtube/live")
        assert response.status_code == 200
        data = response.json()
        assert "is_live" in data
