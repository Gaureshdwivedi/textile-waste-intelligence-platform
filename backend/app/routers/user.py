from fastapi import APIRouter, Depends

from app.core.auth import get_current_user

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.get("/me")
def get_profile(
    current_user=Depends(get_current_user)
):
    return {
        "message": "Authenticated successfully",
        "email": current_user
    }