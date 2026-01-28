from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from datetime import date, datetime, timedelta
from bson import ObjectId
from app.core.database import get_database
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.streak_service import get_streak

router = APIRouter()


@router.get("/habits/{habit_id}")
async def get_habit_analytics(
    habit_id: str,
    current_user: User = Depends(get_current_user),
    days: int = 30,
):
    db = get_database()
    habit = await db.habits.find_one({"_id": ObjectId(habit_id), "user_id": ObjectId(current_user.id)})
    if not habit:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Habit not found")
    
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date, datetime.max.time())
    
    checkins = await db.checkins.find({
        "user_id": ObjectId(current_user.id),
        "habit_id": ObjectId(habit_id),
        "date": {"$gte": start_datetime, "$lte": end_datetime},
    }).to_list(length=1000)
    
    total_days = (end_date - start_date).days + 1
    completed_count = sum(1 for c in checkins if c.get("completed", False))
    completion_rate = (completed_count / total_days * 100) if total_days > 0 else 0
    
    streak_data = await get_streak(ObjectId(current_user.id), ObjectId(habit_id))
    
    skipped_count = sum(1 for c in checkins if c.get("skipped", False))
    
    return {
        "habit_id": habit_id,
        "completion_rate": round(completion_rate, 2),
        "completed_count": completed_count,
        "skipped_count": skipped_count,
        "total_days": total_days,
        "current_streak": streak_data["current_streak"],
        "best_streak": streak_data["best_streak"],
        "checkins": [
            {
                "date": str(c["date"]),
                "completed": c.get("completed", False),
                "value": c.get("value"),
                "skipped": c.get("skipped", False),
            }
            for c in checkins
        ],
    }


@router.get("/heatmap")
async def get_heatmap(
    current_user: User = Depends(get_current_user),
    days: int = 365,
):
    db = get_database()
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    start_datetime = datetime.combine(start_date, datetime.min.time())
    end_datetime = datetime.combine(end_date, datetime.max.time())
    
    checkins = await db.checkins.find({
        "user_id": ObjectId(current_user.id),
        "date": {"$gte": start_datetime, "$lte": end_datetime},
        "completed": True,
    }).to_list(length=10000)
    
    heatmap_data = {}
    for checkin in checkins:
        date_str = str(checkin["date"])
        if date_str not in heatmap_data:
            heatmap_data[date_str] = 0
        heatmap_data[date_str] += 1
    
    return {
        "start_date": str(start_date),
        "end_date": str(end_date),
        "data": heatmap_data,
    }


@router.get("/insights")
async def get_insights(
    current_user: User = Depends(get_current_user),
):
    db = get_database()
    habits = await db.habits.find({"user_id": ObjectId(current_user.id), "archived": False}).to_list(length=100)
    
    insights = []
    
    for habit in habits:
        habit_id = habit["_id"]
        checkins = await db.checkins.find({
            "user_id": ObjectId(current_user.id),
            "habit_id": habit_id,
        }).sort("date", -1).limit(30).to_list(length=30)

        if len(checkins) == 0:
            continue

        completed_count = sum(1 for c in checkins if c.get("completed", False) and not c.get("skipped", False))
        if completed_count > 0:
            insights.append({
                "habit_id": str(habit_id),
                "habit_name": habit["name"],
                "type": "recent_activity",
                "message": f"In the last {len(checkins)} check-ins, you completed '{habit['name']}' {completed_count} time(s).",
            })

        if len(checkins) < 3:
            continue
        
        weekday_completion = {i: 0 for i in range(7)}
        weekday_total = {i: 0 for i in range(7)}
        
        for checkin in checkins:
            checkin_date = checkin["date"]
            if isinstance(checkin_date, datetime):
                weekday = checkin_date.weekday()
            elif isinstance(checkin_date, date):
                weekday = checkin_date.weekday()
            elif isinstance(checkin_date, str):
                weekday = datetime.strptime(checkin_date, "%Y-%m-%d").weekday()
            else:
                continue
            weekday_total[weekday] += 1
            if checkin.get("completed", False):
                weekday_completion[weekday] += 1
        
        best_weekday = max(
            range(7),
            key=lambda d: weekday_completion[d] / weekday_total[d] if weekday_total[d] > 0 else 0,
        )
        worst_weekday = min(
            range(7),
            key=lambda d: weekday_completion[d] / weekday_total[d] if weekday_total[d] > 0 else 1,
        )
        
        weekday_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        
        if weekday_total[best_weekday] > 0:
            insights.append({
                "habit_id": str(habit_id),
                "habit_name": habit["name"],
                "type": "best_weekday",
                "message": f"You complete '{habit['name']}' most often on {weekday_names[best_weekday]}",
            })
    
    return {"insights": insights}
