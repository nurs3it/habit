from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from bson import ObjectId


class Checkin(BaseModel):
    id: Optional[str] = None
    user_id: str
    habit_id: str
    date: date
    completed: bool = False
    value: Optional[float] = None
    skipped: bool = False
    created_at: datetime = datetime.utcnow()

    class Config:
        arbitrary_types_allowed = True


class CheckinCreate(BaseModel):
    habit_id: str
    date: date
    completed: bool = True
    value: Optional[float] = None
    skipped: bool = False


class CheckinResponse(BaseModel):
    id: str
    user_id: str
    habit_id: str
    date: date
    completed: bool
    value: Optional[float] = None
    skipped: bool
    created_at: datetime

    class Config:
        from_attributes = True
