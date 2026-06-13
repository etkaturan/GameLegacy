from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.identity import Identity, ConnectedAccount
from app.schemas.identity import CreateIdentityInput, IdentityOut

router = APIRouter(prefix="/identity", tags=["Identity"])


@router.post("", response_model=IdentityOut)
def create_identity(body: CreateIdentityInput, db: Session = Depends(get_db)):
    """Create a new GameLegacy identity with an initial set of accounts."""
    if not body.steam_ids:
        raise HTTPException(status_code=400, detail="At least one Steam ID required.")

    identity = Identity()
    db.add(identity)
    db.flush()  # get identity.id before commit

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
    """Fetch an identity and its connected accounts."""
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