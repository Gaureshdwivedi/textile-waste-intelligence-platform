from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Depends
)

from sqlalchemy.orm import Session
import os
import shutil
from uuid import uuid4

from app.crud.textile import delete_textile
from app.database import get_db
from app.core.auth import get_current_user
from app.models.user import User
from app.crud.textile import create_textile
from app.crud.textile import (
    create_textile,
    get_user_textiles,
    get_textile_by_id,
    update_textile
)
from app.schemas.textile import TextileUpdate
from app.crud.textile import update_textile
from fastapi import HTTPException

router = APIRouter(
    prefix="/textiles",
    tags=["Textiles"]
)

from fastapi import HTTPException

@router.post("/upload")
async def upload_textile(
    file: UploadFile = File(...),
    textile_name: str = Form(None),
    description: str = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    extension = file.filename.split(".")[-1]
    filename = f"{uuid4()}.{extension}"

    filepath = os.path.join("uploads", filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    textile = create_textile(
        db=db,
        user_id=current_user.id,
        image_path=filepath,
        textile_name=textile_name,
        description=description
    )

    return {
        "message": "Upload successful",
        "textile": {
            "id": textile.id,
            "textile_name": textile.textile_name,
            "description": textile.description,
            "image_path": textile.image_path,
            "uploaded_at": textile.uploaded_at
        }
    }

@router.get("/history")
def get_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    textiles = get_user_textiles(
        db=db,
        user_id=current_user.id
    )

    return {
        "success": True,
        "count": len(textiles),
        "data": textiles
    }

UPLOAD_DIR = "uploads"

os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/{textile_id}")
def get_textile(
    textile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    textile = get_textile_by_id(
        db=db,
        textile_id=textile_id,
        user_id=current_user.id
    )

    if textile is None:
        raise HTTPException(
            status_code=404,
            detail="Textile not found"
        )

    return {
        "success": True,
        "data": textile
    }
    
@router.put("/{textile_id}")
def update_textile_details(
    textile_id: int,
    data: TextileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    textile = get_textile_by_id(
        db=db,
        textile_id=textile_id,
        user_id=current_user.id
    )

    if textile is None:
        raise HTTPException(
            status_code=404,
            detail="Textile not found"
        )

    updated = update_textile(
        db=db,
        textile=textile,
        textile_name=data.textile_name,
        description=data.description
    )

    return {
        "success": True,
        "message": "Textile updated successfully",
        "data": updated
    }    

@router.delete("/{textile_id}")
def delete_textile_route(
    textile_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    textile = get_textile_by_id(
        db=db,
        textile_id=textile_id,
        user_id=current_user.id
    )

    if textile is None:
        raise HTTPException(
            status_code=404,
            detail="Textile not found"
        )

    # Delete image from uploads folder
    if os.path.exists(textile.image_path):
        os.remove(textile.image_path)

    delete_textile(db, textile)

    return {
        "success": True,
        "message": "Textile deleted successfully"
    }
