import uuid
from datetime import datetime

from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Identity(Base):
    """
    A GameLegacy identity — the permanent record a player owns.
    Holds the set of platform accounts connected to it.
    """
    __tablename__ = "identities"

    id = Column(String, primary_key=True, default=generate_uuid)
    created_at = Column(DateTime, default=datetime.utcnow)

    accounts = relationship(
        "ConnectedAccount",
        back_populates="identity",
        cascade="all, delete-orphan",
    )


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