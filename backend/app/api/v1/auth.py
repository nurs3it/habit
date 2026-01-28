from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.dependencies import get_current_user
from app.core.database import get_database
from app.models.user import User, UserCreate, UserResponse
from bson import ObjectId

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    db = get_database()
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    password_hash = get_password_hash(user_data.password)
    from datetime import datetime
    user_dict = {
        "_id": ObjectId(),
        "email": user_data.email,
        "password_hash": password_hash,
        "created_at": datetime.utcnow(),
        "settings": {"theme": "light", "notifications_enabled": True},
    }
    await db.users.insert_one(user_dict)
    return UserResponse(id=str(user_dict["_id"]), email=user_dict["email"], settings=user_dict["settings"])


@router.post("/login")
async def login(user_data: UserCreate):
    db = get_database()
    user = await db.users.find_one({"email": user_data.email})
    if not user or not verify_password(user_data.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user["_id"])}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        settings=current_user.settings,
    )
