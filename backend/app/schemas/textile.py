from pydantic import BaseModel
from datetime import datetime


class TextileResponse(BaseModel):
    id: int
    textile_name: str | None = None
    description: str | None = None
    image_path: str
    prediction: str | None = None
    confidence: str | None = None
    recyclable: str | None = None
    uploaded_at: datetime

    class Config:
        from_attributes = True
        
class TextileUpdate(BaseModel):
    textile_name: str | None = None
    description: str | None = None        