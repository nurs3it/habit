from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import date, datetime
from bson import ObjectId
from app.core.database import get_database
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.checkin import Checkin, CheckinCreate, CheckinResponse
from app.services.streak_service import update_streak, get_streak
from app.services.schedule_service import is_scheduled_on

router = APIRouter()


def datetime_to_date(dt):
    if isinstance(dt, datetime):
        return dt.date()
    elif isinstance(dt, date):
        return dt
    return dt


@router.post("/", response_model=CheckinResponse, status_code=status.HTTP_201_CREATED)
async def create_checkin(
    checkin_data: CheckinCreate,
    current_user: User = Depends(get_current_user),
):
    db = get_database()
    habit = await db.habits.find_one({"_id": ObjectId(checkin_data.habit_id), "user_id": ObjectId(current_user.id)})
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")

    if checkin_data.date > date.today():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot create check-in in the future")

    if not is_scheduled_on(habit.get("schedule"), checkin_data.date):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Habit is not scheduled for this date")
    
    checkin_date_start = datetime.combine(checkin_data.date, datetime.min.time())
    checkin_date_end = datetime.combine(checkin_data.date, datetime.max.time())
    existing = await db.checkins.find_one({
        "user_id": ObjectId(current_user.id),
        "habit_id": ObjectId(checkin_data.habit_id),
        "date": {"$gte": checkin_date_start, "$lte": checkin_date_end},
    })
    
    if existing:
        update_data = {
            "completed": checkin_data.completed,
            "value": checkin_data.value,
            "skipped": checkin_data.skipped,
        }
        await db.checkins.update_one({"_id": existing["_id"]}, {"$set": update_data})
        checkin = await db.checkins.find_one({"_id": existing["_id"]})
    else:
        checkin_date_dt = datetime.combine(checkin_data.date, datetime.min.time())
        checkin_dict = {
            "_id": ObjectId(),
            "user_id": ObjectId(current_user.id),
            "habit_id": ObjectId(checkin_data.habit_id),
            "date": checkin_date_dt,
            "completed": checkin_data.completed,
            "value": checkin_data.value,
            "skipped": checkin_data.skipped,
            "created_at": datetime.utcnow(),
        }
        await db.checkins.insert_one(checkin_dict)
        checkin = checkin_dict
    
    habit_frequency = habit.get("frequency", "daily")
    if checkin_data.completed and not checkin_data.skipped:
        await update_streak(ObjectId(current_user.id), ObjectId(checkin_data.habit_id), checkin_data.date, True, habit_frequency)
    elif checkin_data.skipped:
        await update_streak(ObjectId(current_user.id), ObjectId(checkin_data.habit_id), checkin_data.date, False, habit_frequency)
    
    checkin_date = datetime_to_date(checkin["date"])
    return CheckinResponse(
        id=str(checkin["_id"]),
        user_id=str(checkin["user_id"]),
        habit_id=str(checkin["habit_id"]),
        date=checkin_date,
        completed=checkin["completed"],
        value=checkin.get("value"),
        skipped=checkin.get("skipped", False),
        created_at=checkin.get("created_at", datetime.utcnow()),
    )


@router.get("/", response_model=List[CheckinResponse])
async def get_checkins(
    habit_id: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
):
    db = get_database()
    query = {"user_id": ObjectId(current_user.id)}
    if habit_id:
        query["habit_id"] = ObjectId(habit_id)
    if start_date:
        start_datetime = datetime.combine(start_date, datetime.min.time())
        query["date"] = {"$gte": start_datetime}
    if end_date:
        end_datetime = datetime.combine(end_date, datetime.max.time())
        if "date" in query and isinstance(query["date"], dict):
            query["date"]["$lte"] = end_datetime
        else:
            query["date"] = {"$lte": end_datetime}
    
    checkins = await db.checkins.find(query).sort("date", -1).to_list(length=1000)
    return [
        CheckinResponse(
            id=str(c["_id"]),
            user_id=str(c["user_id"]),
            habit_id=str(c["habit_id"]),
            date=datetime_to_date(c["date"]),
            completed=c["completed"],
            value=c.get("value"),
            skipped=c.get("skipped", False),
            created_at=c.get("created_at", datetime.utcnow()),
        )
        for c in checkins
    ]


@router.get("/today", response_model=List[CheckinResponse])
async def get_today_checkins(
    current_user: User = Depends(get_current_user),
):
    db = get_database()
    today_date = date.today()
    today_start = datetime.combine(today_date, datetime.min.time())
    today_end = datetime.combine(today_date, datetime.max.time())
    checkins = await db.checkins.find({
        "user_id": ObjectId(current_user.id),
        "date": {"$gte": today_start, "$lte": today_end},
    }).to_list(length=100)
    return [
        CheckinResponse(
            id=str(c["_id"]),
            user_id=str(c["user_id"]),
            habit_id=str(c["habit_id"]),
            date=datetime_to_date(c["date"]),
            completed=c["completed"],
            value=c.get("value"),
            skipped=c.get("skipped", False),
            created_at=c.get("created_at", datetime.utcnow()),
        )
        for c in checkins
    ]


@router.delete("/{checkin_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_checkin(
    checkin_id: str,
    current_user: User = Depends(get_current_user),
):
    db = get_database()
    checkin = await db.checkins.find_one({"_id": ObjectId(checkin_id), "user_id": ObjectId(current_user.id)})
    if not checkin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checkin not found")
    
    habit = await db.habits.find_one({"_id": checkin["habit_id"]})
    habit_frequency = habit.get("frequency", "daily") if habit else "daily"
    await db.checkins.delete_one({"_id": ObjectId(checkin_id)})
    checkin_date_obj = datetime_to_date(checkin["date"])
    if isinstance(checkin_date_obj, date):
        await update_streak(
            ObjectId(current_user.id),
            checkin["habit_id"],
            checkin_date_obj,
            False,
            habit_frequency,
        )
