from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql+asyncpg://trackguard:trackguard@localhost:5432/trackguard"
    app_env: str = "development"
    secret_key: str = "change-me-in-production"

    # CORS
    allowed_origins: str = "http://localhost:3000"

    # Slack alerts
    slack_webhook_url: str = ""

    # Email alerts
    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = "alerts@trackguard.local"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
