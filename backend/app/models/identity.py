import json
import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Identity(Base):
    """
    A GameLegacy identity — the permanent record a player owns.
    Holds the set of platform accounts connected to it, plus
    profile customization (username, featured games/achievements).
    """
    __tablename__ = "identities"

    id = Column(String, primary_key=True, default=generate_uuid)
    created_at = Column(DateTime, default=datetime.utcnow)

    username = Column(String, nullable=True)
    pinned_games_json = Column(Text, nullable=True, default="[]")
    pinned_achievements_json = Column(Text, nullable=True, default="[]")

    accounts = relationship(
        "ConnectedAccount",
        back_populates="identity",
        cascade="all, delete-orphan",
    )

    @property
    def pinned_games(self) -> list[int]:
        try:
            return json.loads(self.pinned_games_json or "[]")
        except (TypeError, ValueError):
            return []

    @property
    def pinned_achievements(self) -> list[str]:
        try:
            return json.loads(self.pinned_achievements_json or "[]")
        except (TypeError, ValueError):
            return []


class ConnectedAccount(Base):
    """
    A single connected platform account (e.g. one Steam account)
    linked to an Identity.
    """
    __tablename__ = "connected_accounts"

    id = Column(String, primary_key=True, default=generate_uuid)
    identity_id = Column(String, ForeignKey("identities.id"), nullable=False)
    platform = Column(String, nullable=False, default="steam")
    platform_id = Column(String, nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)

    identity = relationship("Identity", back_populates="accounts")