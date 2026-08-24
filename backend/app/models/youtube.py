from pydantic import BaseModel, Field


class VideoItem(BaseModel):
    id: str = Field(..., description="ID único do vídeo no YouTube", examples=["Lp7C2-79Z-M"])
    title: str = Field(
        ...,
        description="Título do culto ou sermão",
        examples=["Culto de Adoração — IASD Mangueiras Tatuí"],
    )
    description: str = Field(
        ...,
        description="Descrição do vídeo",
        examples=["Transmissão ao vivo do culto de sábado pela manhã."],
    )
    thumbnail_url: str = Field(
        ...,
        description="URL da capa do vídeo",
        examples=["https://i.ytimg.com/vi/Lp7C2-79Z-M/hqdefault.jpg"],
    )
    published_at: str = Field(
        ...,
        description="Data de publicação no formato ISO 8601",
        examples=["2026-08-23T12:00:00Z"],
    )
    video_url: str = Field(
        ...,
        description="URL canônica para visualização no YouTube",
        examples=["https://www.youtube.com/watch?v=Lp7C2-79Z-M"],
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "id": "Lp7C2-79Z-M",
                "title": "Culto de Adoração — IASD Mangueiras Tatuí",
                "description": "Transmissão ao vivo do culto de sábado pela manhã.",
                "thumbnail_url": "https://i.ytimg.com/vi/Lp7C2-79Z-M/hqdefault.jpg",
                "published_at": "2026-08-23T12:00:00Z",
                "video_url": "https://www.youtube.com/watch?v=Lp7C2-79Z-M",
            }
        }
    }


class YouTubeLatestResponse(BaseModel):
    channel_id: str = Field(
        ...,
        description="ID do canal oficial no YouTube",
        examples=["UC4x7BBBm6Ds1JZYit0yMhuQ"],
    )
    videos: list[VideoItem] = Field(
        ...,
        description="Lista dos vídeos mais recentes publicados no canal",
    )


class YouTubeLiveResponse(BaseModel):
    is_live: bool = Field(
        ...,
        description="Indica se o canal está transmitindo ao vivo no momento",
        examples=[False],
    )
    live_video: VideoItem | None = Field(
        None,
        description="Dados do vídeo da transmissão ao vivo ativa, se houver",
    )
