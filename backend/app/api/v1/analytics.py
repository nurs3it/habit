from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Dict, Any
from datetime import date, datetime, timedelta
from bson import ObjectId
from app.core.database import get_database
from app.core.dependencies import get_current_user
from app.models.user import User
from app.services.streak_service import get_streak
from app.services.schedule_service import is_scheduled_on

router = APIRouter()

WEEKDAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
TIPS_POOL = [
    "Small steps every day beat big efforts once a week. Keep it consistent!",
    "Morning habits tend to stick better. Try scheduling your most important habit first.",
    "Tracking builds awareness. You're already ahead by checking in daily.",
    "Missing a day? Don't break the chain—resume the next day and keep your streak logic.",
    "Stack a new habit with an existing one: 'After I pour coffee, I do X.'",
    "Celebrate perfect days. They prove you can do it all when it matters.",
    "Weekly review: notice which weekday you perform best and protect that day.",
    "One habit at 100% is better than five at 20%. Focus wins.",
]


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


def _to_date(d) -> date:
    if isinstance(d, datetime):
        return d.date()
    if isinstance(d, date):
        return d
    if isinstance(d, str):
        return datetime.strptime(d[:10], "%Y-%m-%d").date()
    return d


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
        d = _to_date(checkin["date"])
        date_str = d.strftime("%Y-%m-%d")
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
    user_id = ObjectId(current_user.id)
    habits = await db.habits.find({"user_id": user_id, "archived": False}).to_list(length=100)
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    week_end = today
    start_dt = datetime.combine(week_start, datetime.min.time())
    end_dt = datetime.combine(week_end, datetime.max.time())
    week_checkins = await db.checkins.find({
        "user_id": user_id,
        "date": {"$gte": start_dt, "$lte": end_dt},
        "completed": True,
    }).to_list(length=500)
    by_date: Dict[str, set] = {}
    for c in week_checkins:
        d = _to_date(c["date"])
        key = d.strftime("%Y-%m-%d")
        if key not in by_date:
            by_date[key] = set()
        by_date[key].add(str(c["habit_id"]))
    total_scheduled = 0
    total_completed = 0
    perfect_days = 0
    d = week_start
    while d <= week_end:
        scheduled_ids = [
            str(h["_id"]) for h in habits
            if is_scheduled_on(h.get("schedule"), d)
        ]
        total_scheduled += len(scheduled_ids)
        key = d.strftime("%Y-%m-%d")
        completed_ids = by_date.get(key) or set()
        total_completed += sum(1 for hid in scheduled_ids if hid in completed_ids)
        if scheduled_ids and all(hid in completed_ids for hid in scheduled_ids):
            perfect_days += 1
        d += timedelta(days=1)
    week_completion_pct = round((total_completed / total_scheduled * 100), 1) if total_scheduled else 0
    best_streak_habit = None
    best_streak_value = 0
    for habit in habits:
        streak_data = await get_streak(user_id, habit["_id"])
        cur = streak_data.get("current_streak") or 0
        if cur > best_streak_value:
            best_streak_value = cur
            best_streak_habit = habit["name"]
    summary = {
        "total_habits": len(habits),
        "week_checkins": total_completed,
        "week_scheduled": total_scheduled,
        "week_completion_pct": week_completion_pct,
        "perfect_days_this_week": perfect_days,
        "best_streak": best_streak_value,
        "best_streak_habit": best_streak_habit,
    }
    tips = []
    if perfect_days > 0:
        tips.append({
            "type": "perfect_days",
            "title": "Perfect days this week",
            "message": f"You completed all scheduled habits on {perfect_days} day(s). Great consistency!",
        })
    if best_streak_value > 0 and best_streak_habit:
        tips.append({
            "type": "streak",
            "title": "On fire",
            "message": f"Your best active streak is {best_streak_value} day(s) with «{best_streak_habit}». Keep it up!",
        })
    if week_completion_pct >= 80 and total_scheduled > 0:
        tips.append({
            "type": "strong_week",
            "title": "Strong week",
            "message": f"You hit {week_completion_pct}% completion this week. You're building a solid routine.",
        })
    elif total_scheduled > 0 and week_completion_pct < 50:
        tips.append({
            "type": "nudge",
            "title": "Small win",
            "message": "This week was tough. Tomorrow, aim to complete just one habit—momentum starts with one check-in.",
        })
    tip_index = (today.toordinal() % len(TIPS_POOL)) if TIPS_POOL else 0
    tips.append({
        "type": "advice",
        "title": "Tip of the day",
        "message": TIPS_POOL[tip_index],
    })
    insights = []
    for habit in habits:
        habit_id = habit["_id"]
        checkins = await db.checkins.find({
            "user_id": user_id,
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
                "message": f"In the last {len(checkins)} check-ins, you completed «{habit['name']}» {completed_count} time(s).",
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
                weekday = datetime.strptime(checkin_date[:10], "%Y-%m-%d").weekday()
            else:
                continue
            weekday_total[weekday] += 1
            if checkin.get("completed", False):
                weekday_completion[weekday] += 1
        best_weekday = max(
            range(7),
            key=lambda d: weekday_completion[d] / weekday_total[d] if weekday_total[d] > 0 else 0,
        )
        if weekday_total[best_weekday] > 0:
            insights.append({
                "habit_id": str(habit_id),
                "habit_name": habit["name"],
                "type": "best_weekday",
                "message": f"You complete «{habit['name']}» most often on {WEEKDAY_NAMES[best_weekday]}.",
            })
    return {
        "summary": summary,
        "tips": tips,
        "insights": insights,
    }
