from datetime import date, datetime, timedelta
from bson import ObjectId
from app.core.database import get_database
from app.models.streak import Streak


async def calculate_streak(user_id: ObjectId, habit_id: ObjectId, frequency: str = "daily", as_of_date: date = None) -> dict:
    if as_of_date is None:
        as_of_date = date.today()
    
    db = get_database()
    as_of_datetime = datetime.combine(as_of_date, datetime.max.time())
    checkins = await db.checkins.find({
        "user_id": user_id,
        "habit_id": habit_id,
        "completed": True,
        "skipped": False,
        "date": {"$lte": as_of_datetime},
    }).sort("date", -1).to_list(length=1000)
    
    if not checkins:
        return {"current_streak": 0, "best_streak": 0, "last_checkin_date": None}
    
    completed_dates = []
    for c in checkins:
        checkin_date = c.get("date")
        if isinstance(checkin_date, datetime):
            checkin_date = checkin_date.date()
        if checkin_date <= as_of_date:
            completed_dates.append(checkin_date)
    
    completed_dates = sorted(set(completed_dates), reverse=True)
    
    if frequency == "weekly":
        completed_weeks = []
        for d in completed_dates:
            week_start = d - timedelta(days=d.weekday())
            if week_start not in completed_weeks:
                completed_weeks.append(week_start)
        completed_weeks = sorted(completed_weeks, reverse=True)
        
        current_streak = 0
        best_streak = 0
        temp_streak = 0
        as_of_week_start = as_of_date - timedelta(days=as_of_date.weekday())
        prev_week_start = as_of_week_start - timedelta(days=7)
        
        for i, week_start in enumerate(completed_weeks):
            if i == 0:
                if week_start == as_of_week_start or week_start == prev_week_start:
                    temp_streak = 1
                    current_streak = 1
                else:
                    temp_streak = 1
            else:
                prev_week = completed_weeks[i - 1]
                weeks_diff = (prev_week - week_start).days // 7
                if weeks_diff == 1:
                    temp_streak += 1
                    if week_start == as_of_week_start or week_start == prev_week_start:
                        current_streak = temp_streak
                else:
                    temp_streak = 1
            best_streak = max(best_streak, temp_streak)
        
        last_checkin_date = completed_weeks[0] if completed_weeks else None
    else:
        current_streak = 0
        best_streak = 0
        temp_streak = 0
        yesterday = as_of_date - timedelta(days=1)
        date_set = set(completed_dates)
        
        if as_of_date in date_set or yesterday in date_set:
            start_date = as_of_date if as_of_date in date_set else yesterday
            streak_count = 0
            check_date = start_date
            while check_date in date_set:
                streak_count += 1
                check_date = check_date - timedelta(days=1)
            current_streak = streak_count
        
        for i, d in enumerate(completed_dates):
            if i == 0:
                temp_streak = 1
            else:
                prev_date = completed_dates[i - 1]
                days_diff = (prev_date - d).days
                if days_diff == 1:
                    temp_streak += 1
                else:
                    temp_streak = 1
            best_streak = max(best_streak, temp_streak)
        
        last_checkin_date = completed_dates[0] if completed_dates else None
    
    return {
        "current_streak": current_streak,
        "best_streak": best_streak,
        "last_checkin_date": datetime.combine(last_checkin_date, datetime.min.time()) if last_checkin_date else None,
    }


async def update_streak(user_id: ObjectId, habit_id: ObjectId, checkin_date: date, completed: bool, frequency: str = "daily"):
    streak_data = await calculate_streak(user_id, habit_id, frequency)
    
    db = get_database()
    streak = await db.streaks.find_one({"user_id": user_id, "habit_id": habit_id})
    
    if not streak:
        streak_dict = {
            "_id": ObjectId(),
            "user_id": user_id,
            "habit_id": habit_id,
            "current_streak": streak_data["current_streak"],
            "best_streak": streak_data["best_streak"],
            "last_checkin_date": streak_data["last_checkin_date"],
            "updated_at": datetime.combine(date.today(), datetime.min.time()),
        }
        await db.streaks.insert_one(streak_dict)
    else:
        await db.streaks.update_one(
            {"user_id": user_id, "habit_id": habit_id},
            {
                "$set": {
                    "current_streak": streak_data["current_streak"],
                    "best_streak": streak_data["best_streak"],
                    "last_checkin_date": streak_data["last_checkin_date"],
                    "updated_at": datetime.combine(date.today(), datetime.min.time()),
                }
            },
        )


async def get_streak(user_id: ObjectId, habit_id: ObjectId, frequency: str = "daily", as_of_date: date = None) -> dict:
    return await calculate_streak(user_id, habit_id, frequency, as_of_date)
