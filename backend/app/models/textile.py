from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.database import Base


class Textile(Base):
    __tablename__ = "textiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    image_path = Column(String, nullable=False)

    textile_name = Column(String, nullable=True)

    description = Column(String, nullable=True)

    prediction = Column(String(100), nullable=True)

    confidence = Column(String(20), nullable=True)

    recyclable = Column(String(20), nullable=True)

    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User")