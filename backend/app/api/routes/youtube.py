from fastapi import APIRouter
from app.models.youtube import YouTubeLatestResponse, YouTubeLiveResponse
from app.services.youtube_service import youtube_service

router = APIRouter(prefix="/youtube", tags=["youtube"])


@router.get("/latest", response_model=YouTubeLatestResponse)
async def get_latest_videos() -> YouTubeLatestResponse:
    return await youtube_service.get_latest_videos()


@router.get("/live", response_model=YouTubeLiveResponse)
async def get_live_status() -> YouTubeLiveResponse:
    return await youtube_service.get_live_status()
