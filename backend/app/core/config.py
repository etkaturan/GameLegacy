from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "GameLegacy"
    debug: bool = False
    steam_api_key: str = ""

    class Config:
        env_file = ".env"

settings = Settings()