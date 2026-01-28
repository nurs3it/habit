from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from bson import ObjectId
from app.core.database import get_database
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.habit import Habit, HabitCreate, HabitUpdate, HabitResponse
from app.services.streak_service import get_streak
from app.services.schedule_service import normalize_schedule
from datetime import datetime, date

router = APIRouter()


@router.get("/", response_model=List[HabitResponse])
async def get_habits(
    current_user: User = Depends(get_current_user),
    archived: bool = False,
    as_of_date: Optional[date] = None,
):
    db = get_database()
    query = {"user_id": ObjectId(current_user.id), "archived": archived}
    habits = await db.habits.find(query).sort("order", 1).to_list(length=100)
    result = []
    for h in habits:
        habit_frequency = h.get("frequency", "daily")
        streak_data = await get_streak(ObjectId(current_user.id), h["_id"], habit_frequency, as_of_date)
        result.append(
            HabitResponse(
                id=str(h["_id"]),
                user_id=str(h["user_id"]),
                name=h["name"],
                type=h["type"],
                frequency=h["frequency"],
                schedule=h.get("schedule"),
                time_of_day=h.get("time_of_day"),
                start_date=h["start_date"],
                goal=h.get("goal"),
                color=h.get("color", "#3B82F6"),
                icon=h.get("icon"),
                category=h.get("category"),
                order=h.get("order", 0),
                archived=h.get("archived", False),
                created_at=h.get("created_at", datetime.utcnow()),
                current_streak=streak_data["current_streak"],
            )
        )
    return result


@router.post("/", response_model=HabitResponse, status_code=status.HTTP_201_CREATED)
async def create_habit(
    habit_data: HabitCreate,
    current_user: User = Depends(get_current_user),
):
    db = get_database()
    count = await db.habits.count_documents({"user_id": ObjectId(current_user.id), "archived": False})
    schedule = normalize_schedule(habit_data.schedule, date.today())
    habit_dict = {
        "_id": ObjectId(),
        "user_id": ObjectId(current_user.id),
        "name": habit_data.name,
        "type": habit_data.type,
        "frequency": habit_data.frequency,
        "schedule": schedule,
        "time_of_day": habit_data.time_of_day,
        "start_date": habit_data.start_date,
        "goal": habit_data.goal,
        "color": habit_data.color or "#3B82F6",
        "icon": habit_data.icon,
        "category": habit_data.category,
        "order": count,
        "archived": False,
        "created_at": datetime.utcnow(),
    }
    await db.habits.insert_one(habit_dict)
    habit_frequency = habit_dict.get("frequency", "daily")
    streak_data = await get_streak(ObjectId(current_user.id), habit_dict["_id"], habit_frequency)
    return HabitResponse(
        id=str(habit_dict["_id"]),
        user_id=str(habit_dict["user_id"]),
        name=habit_dict["name"],
        type=habit_dict["type"],
        frequency=habit_dict["frequency"],
        schedule=habit_dict.get("schedule"),
        time_of_day=habit_dict.get("time_of_day"),
        start_date=habit_dict["start_date"],
        goal=habit_dict.get("goal"),
        color=habit_dict.get("color", "#3B82F6"),
        icon=habit_dict.get("icon"),
        category=habit_dict.get("category"),
        order=habit_dict.get("order", 0),
        archived=habit_dict.get("archived", False),
        created_at=habit_dict.get("created_at", datetime.utcnow()),
        current_streak=streak_data["current_streak"],
    )


@router.get("/{habit_id}", response_model=HabitResponse)
async def get_habit(
    habit_id: str,
    current_user: User = Depends(get_current_user),
):
    db = get_database()
    habit = await db.habits.find_one({"_id": ObjectId(habit_id), "user_id": ObjectId(current_user.id)})
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    habit_frequency = habit.get("frequency", "daily")
    streak_data = await get_streak(ObjectId(current_user.id), habit["_id"], habit_frequency)
    return HabitResponse(
        id=str(habit["_id"]),
        user_id=str(habit["user_id"]),
        name=habit["name"],
        type=habit["type"],
        frequency=habit["frequency"],
        schedule=habit.get("schedule"),
        time_of_day=habit.get("time_of_day"),
        start_date=habit["start_date"],
        goal=habit.get("goal"),
        color=habit.get("color", "#3B82F6"),
        icon=habit.get("icon"),
        category=habit.get("category"),
        order=habit.get("order", 0),
        archived=habit.get("archived", False),
        created_at=habit.get("created_at", datetime.utcnow()),
        current_streak=streak_data["current_streak"],
    )


@router.put("/{habit_id}", response_model=HabitResponse)
async def update_habit(
    habit_id: str,
    habit_data: HabitUpdate,
    current_user: User = Depends(get_current_user),
):
    db = get_database()
    habit = await db.habits.find_one({"_id": ObjectId(habit_id), "user_id": ObjectId(current_user.id)})
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    update_data = habit_data.model_dump(exclude_unset=True)
    if "schedule" in update_data:
        update_data["schedule"] = normalize_schedule(update_data.get("schedule"), date.today())
    await db.habits.update_one(
        {"_id": ObjectId(habit_id)},
        {"$set": update_data},
    )
    updated_habit = await db.habits.find_one({"_id": ObjectId(habit_id)})
    habit_frequency = updated_habit.get("frequency", "daily")
    streak_data = await get_streak(ObjectId(current_user.id), updated_habit["_id"], habit_frequency)
    return HabitResponse(
        id=str(updated_habit["_id"]),
        user_id=str(updated_habit["user_id"]),
        name=updated_habit["name"],
        type=updated_habit["type"],
        frequency=updated_habit["frequency"],
        schedule=updated_habit.get("schedule"),
        time_of_day=updated_habit.get("time_of_day"),
        start_date=updated_habit["start_date"],
        goal=updated_habit.get("goal"),
        color=updated_habit.get("color", "#3B82F6"),
        icon=updated_habit.get("icon"),
        category=updated_habit.get("category"),
        order=updated_habit.get("order", 0),
        archived=updated_habit.get("archived", False),
        created_at=updated_habit.get("created_at", datetime.utcnow()),
        current_streak=streak_data["current_streak"],
    )


@router.delete("/{habit_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_habit(
    habit_id: str,
    current_user: User = Depends(get_current_user),
):
    db = get_database()
    result = await db.habits.delete_one({"_id": ObjectId(habit_id), "user_id": ObjectId(current_user.id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    await db.checkins.delete_many({"habit_id": ObjectId(habit_id)})
    await db.streaks.delete_many({"habit_id": ObjectId(habit_id)})


@router.patch("/{habit_id}/order")
async def update_habit_order(
    habit_id: str,
    order: int,
    current_user: User = Depends(get_current_user),
):
    db = get_database()
    result = await db.habits.update_one(
        {"_id": ObjectId(habit_id), "user_id": ObjectId(current_user.id)},
        {"$set": {"order": order}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    return {"message": "Order updated"}


@router.post("/{habit_id}/archive")
async def archive_habit(
    habit_id: str,
    current_user: User = Depends(get_current_user),
):
    db = get_database()
    result = await db.habits.update_one(
        {"_id": ObjectId(habit_id), "user_id": ObjectId(current_user.id)},
        {"$set": {"archived": True}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    return {"message": "Habit archived"}
