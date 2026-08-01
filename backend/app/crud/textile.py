from sqlalchemy.orm import Session
from app.models.textile import Textile


def create_textile(
    db: Session,
    user_id: int,
    image_path: str,
    textile_name: str = None,
    description: str = None
):
    textile = Textile(
        user_id=user_id,
        image_path=image_path,
        textile_name=textile_name,
        description=description
    )

    db.add(textile)
    db.commit()
    db.refresh(textile)

    return textile

def get_user_textiles(db: Session, user_id: int):
    return (
        db.query(Textile)
        .filter(Textile.user_id == user_id)
        .order_by(Textile.uploaded_at.desc())
        .all()
    )
    
def get_textile_by_id(db: Session, textile_id: int, user_id: int):
    return (
        db.query(Textile)
        .filter(
            Textile.id == textile_id,
            Textile.user_id == user_id
        )
        .first()
    )    
def update_textile(
    db: Session,
    textile: Textile,
    textile_name: str = None,
    description: str = None
):
    if textile_name is not None:
        textile.textile_name = textile_name

    if description is not None:
        textile.description = description

    db.commit()
    db.refresh(textile)

    return textile    

def delete_textile(db: Session, textile: Textile):
    db.delete(textile)
    db.commit()