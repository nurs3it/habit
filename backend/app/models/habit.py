from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from bson import ObjectId


class Habit(BaseModel):
    id: Optional[str] = None
    user_id: str
    name: str
    type: str
    frequency: str
    schedule: Optional[dict] = None
    time_of_day: Optional[str] = None
    start_date: datetime
    goal: Optional[dict] = None
    color: str = "#3B82F6"
    icon: Optional[str] = None
    category: Optional[str] = None
    order: int = 0
    archived: bool = False
    created_at: datetime = datetime.utcnow()

    class Config:
        arbitrary_types_allowed = True


class HabitCreate(BaseModel):
    name: str
    type: str
    frequency: str
    schedule: Optional[dict] = None
    time_of_day: Optional[str] = None
    start_date: datetime
    goal: Optional[dict] = None
    color: Optional[str] = "#3B82F6"
    icon: Optional[str] = None
    category: Optional[str] = None


class HabitUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    frequency: Optional[str] = None
    schedule: Optional[dict] = None
    time_of_day: Optional[str] = None
    goal: Optional[dict] = None
    color: Optional[str] = None
    icon: Optional[str] = None
    category: Optional[str] = None
    order: Optional[int] = None
    archived: Optional[bool] = None


class HabitResponse(BaseModel):
    id: str
    user_id: str
    name: str
    type: str
    frequency: str
    schedule: Optional[dict] = None
    time_of_day: Optional[str] = None
    start_date: datetime
    goal: Optional[dict] = None
    color: str
    icon: Optional[str] = None
    category: Optional[str] = None
    order: int
    archived: bool
    created_at: datetime
    current_streak: Optional[int] = 0

    class Config:
        from_attributes = True
