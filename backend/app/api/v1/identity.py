import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.identity import Identity, ConnectedAccount
from app.schemas.identity import (
    CreateIdentityInput,
    UpdateUsernameInput,
    UpdatePinsInput,
    IdentityOut,
)

router = APIRouter(prefix="/identity", tags=["Identity"])

MAX_PINS = 6


@router.post("", response_model=IdentityOut)
def create_identity(body: CreateIdentityInput, db: Session = Depends(get_db)):
    """Create a new GameLegacy identity with an initial set of accounts."""
    if not body.steam_ids:
        raise HTTPException(status_code=400, detail="At least one Steam ID required.")

    identity = Identity()
    db.add(identity)
    db.flush()

    for steam_id in body.steam_ids:
        db.add(ConnectedAccount(
            identity_id=identity.id,
            platform="steam",
            platform_id=steam_id,
        ))

    db.commit()
    db.refresh(identity)
    return identity


@router.get("/{identity_id}", response_model=IdentityOut)
def get_identity(identity_id: str, db: Session = Depends(get_db)):
    """Fetch an identity, its connected accounts, and profile customization."""
    identity = db.query(Identity).filter(Identity.id == identity_id).first()
    if not identity:
        raise HTTPException(status_code=404, detail="Identity not found.")
    return identity


@router.put("/{identity_id}", response_model=IdentityOut)
def update_identity(identity_id: str, body: CreateIdentityInput, db: Session = Depends(get_db)):
    """Replace the full set of connected accounts for an identity."""
    identity = db.query(Identity).filter(Identity.id == identity_id).first()
    if not identity:
        raise HTTPException(status_code=404, detail="Identity not found.")

    if not body.steam_ids:
        raise HTTPException(status_code=400, detail="At least one Steam ID required.")

    db.query(ConnectedAccount).filter(ConnectedAccount.identity_id == identity_id).delete()

    for steam_id in body.steam_ids:
        db.add(ConnectedAccount(
            identity_id=identity_id,
            platform="steam",
            platform_id=steam_id,
        ))

    db.commit()
    db.refresh(identity)
    return identity


@router.patch("/{identity_id}/username", response_model=IdentityOut)
def update_username(identity_id: str, body: UpdateUsernameInput, db: Session = Depends(get_db)):
    """Set a custom GameLegacy display name for an identity."""
    identity = db.query(Identity).filter(Identity.id == identity_id).first()
    if not identity:
        raise HTTPException(status_code=404, detail="Identity not found.")

    identity.username = body.username.strip()
    db.commit()
    db.refresh(identity)
    return identity


@router.patch("/{identity_id}/pins", response_model=IdentityOut)
def update_pins(identity_id: str, body: UpdatePinsInput, db: Session = Depends(get_db)):
    """Update featured (pinned) games and/or achievements for an identity."""
    identity = db.query(Identity).filter(Identity.id == identity_id).first()
    if not identity:
        raise HTTPException(status_code=404, detail="Identity not found.")

    if body.pinned_games is not None:
        if len(body.pinned_games) > MAX_PINS:
            raise HTTPException(status_code=400, detail=f"Maximum {MAX_PINS} pinned games.")
        identity.pinned_games_json = json.dumps(body.pinned_games)

    if body.pinned_achievements is not None:
        if len(body.pinned_achievements) > MAX_PINS:
            raise HTTPException(status_code=400, detail=f"Maximum {MAX_PINS} pinned achievements.")
        identity.pinned_achievements_json = json.dumps(body.pinned_achievements)

    db.commit()
    db.refresh(identity)
    return identity