from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from bson import ObjectId


class UserSettings(BaseModel):
    theme: str = "light"
    notifications_enabled: bool = True


class User(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    password_hash: str
    created_at: datetime = datetime.utcnow()
    settings: UserSettings = UserSettings()

    class Config:
        arbitrary_types_allowed = True


class UserCreate(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    settings: UserSettings

    class Config:
        from_attributes = True
