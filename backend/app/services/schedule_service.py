from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional


def _to_date_str(d: date) -> str:
    return d.strftime("%Y-%m-%d")


def _parse_date(value: Any) -> Optional[date]:
    if value is None:
        return None
    if isinstance(value, date) and not isinstance(value, datetime):
        return value
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, str):
        try:
            return datetime.strptime(value, "%Y-%m-%d").date()
        except ValueError:
            return None
    return None


def normalize_schedule(schedule: Optional[Dict[str, Any]], today: Optional[date] = None) -> Dict[str, Any]:
    if today is None:
        today = date.today()

    if not schedule or not isinstance(schedule, dict):
        return {"mode": "all_time"}

    mode = schedule.get("mode") or "all_time"

    if mode == "all_time":
        return {"mode": "all_time"}

    if mode == "days_21":
        start = today
        end = today + timedelta(days=20)
        return {"mode": "days_21", "start": _to_date_str(start), "end": _to_date_str(end)}

    if mode == "date_range":
        start = today
        end = _parse_date(schedule.get("end")) or _parse_date(schedule.get("to")) or _parse_date(schedule.get("until"))
        if end is None:
            end = today
        if end < start:
            end = start
        return {"mode": "date_range", "start": _to_date_str(start), "end": _to_date_str(end)}

    if mode == "weekdays":
        start = today
        raw_days = schedule.get("days") or []
        days: List[int] = []
        for x in raw_days:
            try:
                v = int(x)
            except (TypeError, ValueError):
                continue
            if 1 <= v <= 7 and v not in days:
                days.append(v)
        days.sort()
        return {"mode": "weekdays", "start": _to_date_str(start), "days": days}

    if mode == "specific_dates":
        start = today
        raw_dates = schedule.get("dates") or schedule.get("days") or []
        dates: List[str] = []
        for x in raw_dates:
            d = _parse_date(x)
            if not d:
                continue
            if d < start:
                continue
            s = _to_date_str(d)
            if s not in dates:
                dates.append(s)
        dates.sort()
        return {"mode": "specific_dates", "start": _to_date_str(start), "dates": dates}

    return {"mode": "all_time"}


def is_scheduled_on(schedule: Optional[Dict[str, Any]], day: date) -> bool:
    schedule = normalize_schedule(schedule)
    mode = schedule.get("mode") or "all_time"

    if mode == "all_time":
        return True

    start = _parse_date(schedule.get("start"))
    if start and day < start:
        return False

    if mode in ("date_range", "days_21"):
        end = _parse_date(schedule.get("end"))
        if end and day > end:
            return False
        return True

    if mode == "weekdays":
        days = schedule.get("days") or []
        iso = day.isoweekday()
        return iso in set(int(x) for x in days if isinstance(x, int) or (isinstance(x, str) and x.isdigit()))

    if mode == "specific_dates":
        dates = set(schedule.get("dates") or [])
        return _to_date_str(day) in dates

    return True
