from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    app_name: str = "IASD Mangueiras API"
    app_env: str = "development"
    debug: bool = False

    # CORS origins
    cors_origins: list[str] = [
        "https://iasdmangueiras.org.br",
        "http://localhost:4200",
        "http://localhost:4000",
        "http://127.0.0.1:4200",
        "http://127.0.0.1:4000",
    ]

    # YouTube API
    youtube_api_key: str = ""
    youtube_channel_id: str = "UC4x7BBBm6Ds1JZYit0yMhuQ"
    youtube_cache_ttl_seconds: int = 1800  # 30 minutos

    # Notificações e Webhooks (Telegram / Discord / WhatsApp)
    telegram_bot_token: str = ""
    telegram_chat_id: str = ""
    notification_webhook_url: str = ""
    notifications_enabled: bool = True


settings = Settings()
