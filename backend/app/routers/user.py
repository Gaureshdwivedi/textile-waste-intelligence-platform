from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.models.user import User
from app.database import get_db


router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# ==========================================================
# UPDATE USER SCHEMA
# ==========================================================

class UserUpdate(BaseModel):
    full_name: str


# ==========================================================
# GET CURRENT USER
# ==========================================================

@router.get("/me")
def get_profile(
    current_user: User = Depends(get_current_user)
):
    return {
        "message": "Authenticated successfully",
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email
    }


# ==========================================================
# UPDATE CURRENT USER
# ==========================================================

@router.put("/me")
def update_profile(
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Update full name
    current_user.full_name = data.full_name

    # Save changes
    db.commit()

    # Refresh object from database
    db.refresh(current_user)

    return {
        "message": "Profile updated successfully",
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email
    }