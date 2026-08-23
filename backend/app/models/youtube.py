from pydantic import BaseModel


class VideoItem(BaseModel):
    id: str
    title: str
    description: str
    thumbnail_url: str
    published_at: str
    video_url: str


class YouTubeLatestResponse(BaseModel):
    channel_id: str
    videos: list[VideoItem]


class YouTubeLiveResponse(BaseModel):
    is_live: bool
    live_video: VideoItem | None = None
