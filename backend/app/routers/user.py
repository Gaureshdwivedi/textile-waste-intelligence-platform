from fastapi import APIRouter, Depends

from app.core.auth import get_current_user
from app.models.user import User

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


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