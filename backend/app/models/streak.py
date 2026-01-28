from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date
from bson import ObjectId


class Streak(BaseModel):
    id: Optional[str] = None
    user_id: str
    habit_id: str
    current_streak: int = 0
    best_streak: int = 0
    last_checkin_date: Optional[date] = None
    updated_at: datetime = datetime.utcnow()

    class Config:
        arbitrary_types_allowed = True


class StreakResponse(BaseModel):
    id: str
    user_id: str
    habit_id: str
    current_streak: int
    best_streak: int
    last_checkin_date: Optional[date] = None
    updated_at: datetime

    class Config:
        from_attributes = True
