import urllib.parse
from pathlib import Path
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ENV_FILE = BACKEND_DIR / ".env"


def parse_and_encode_db_url(url: str) -> str:
    """
    Safely parses a database URL and percent-encodes credentials (username and password)
    without corrupting the hostname, port, database, or query parameters.
    Handles passwords with special characters such as @, #, [, ], %, etc.,
    and strips unintentional template wrapper brackets (e.g. [YOUR-PASSWORD]).
    Ensures postgresql+psycopg2 driver scheme and sslmode=require for remote databases.
    """
    if not url or not isinstance(url, str):
        return url

    url = url.strip()
    if url.startswith("sqlite"):
        return url

    scheme = ""
    rest = url
    if "://" in url:
        scheme, rest = url.split("://", 1)

    # Normalize scheme to use the postgresql+psycopg2 driver
    if scheme in ("postgres", "postgresql", "postgresql+psycopg2"):
        target_scheme = "postgresql+psycopg2"
    else:
        target_scheme = scheme or "postgresql+psycopg2"

    if "@" in rest:
        # Separate authority from path and query
        slash_idx = rest.find("/")
        question_idx = rest.find("?")

        path_start = len(rest)
        if slash_idx != -1 and question_idx != -1:
            path_start = min(slash_idx, question_idx)
        elif slash_idx != -1:
            path_start = slash_idx
        elif question_idx != -1:
            path_start = question_idx

        authority_part = rest[:path_start]
        path_and_query = rest[path_start:]

        if "@" in authority_part:
            # The last '@' before the path/query separates user credentials from the hostname
            userinfo, host_port = authority_part.rsplit("@", 1)

            if ":" in userinfo:
                username, password = userinfo.split(":", 1)
            else:
                username, password = userinfo, ""

            # If user wrapped password in template placeholder brackets [password], strip them
            if password.startswith("[") and password.endswith("]"):
                password = password[1:-1]

            # URL-encode username and password safely
            encoded_username = urllib.parse.quote(username, safe="")
            encoded_password = urllib.parse.quote(password, safe="")

            encoded_authority = (
                f"{encoded_username}:{encoded_password}@{host_port}"
                if password
                else f"{encoded_username}@{host_port}"
            )
            rest = f"{encoded_authority}{path_and_query}"
        else:
            rest = f"{authority_part}{path_and_query}"

    # Enforce sslmode=require for remote connections if not explicitly set
    if not any(h in rest for h in ["localhost", "127.0.0.1"]):
        if "sslmode=" not in rest:
            sep = "&" if "?" in rest else "?"
            rest = f"{rest}{sep}sslmode=require"

    return f"{target_scheme}://{rest}"


class Settings(BaseSettings):
    PROJECT_NAME: str = "Sleep Cycle API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str = "sleep_cycle_super_secure_jwt_secret_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # Database
    DATABASE_URL: str = "sqlite:///./sleepcycle.db"
    SUPABASE_SESSION_POOLER_URI: str = ""
    SUPABASE_DATABASE_URL: str = ""

    # Supabase (optional)
    SUPABASE_URL: str = ""
    SUPABASE_KEY: str = ""

    # AI Coach
    AI_PROVIDER: str = "neuro_science"  # neuro_science, openai, gemini, anthropic
    AI_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5500",
        "http://127.0.0.1:5500",
        "http://localhost:5501",
        "http://127.0.0.1:5501",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "null",
    ]

    @model_validator(mode="after")
    def assemble_db_connection(self) -> "Settings":
        # Prioritize Supabase Session Pooler URI if provided in environment or .env
        candidate = (
            (self.SUPABASE_SESSION_POOLER_URI or "").strip()
            or (self.SUPABASE_DATABASE_URL or "").strip()
            or (self.DATABASE_URL or "").strip()
        )

        if candidate:
            self.DATABASE_URL = parse_and_encode_db_url(candidate)

        return self

    model_config = SettingsConfigDict(
        env_file=(str(ENV_FILE), ".env"),
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()


