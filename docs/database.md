# Database Schema

## MongoDB Collections

### users

```json
{
  "_id": "ObjectId",
  "email": "user@example.com",
  "password_hash": "hashed_password",
  "created_at": "2024-01-01T00:00:00",
  "settings": {
    "theme": "light",
    "notifications_enabled": true
  }
}
```

### habits

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "name": "Drink water",
  "type": "positive",
  "frequency": "daily",
  "schedule": {},
  "time_of_day": "morning",
  "start_date": "2024-01-01T00:00:00",
  "goal": {
    "type": "quantity",
    "value": 2,
    "unit": "liters"
  },
  "color": "#3B82F6",
  "icon": "water",
  "category": "health",
  "order": 0,
  "archived": false,
  "created_at": "2024-01-01T00:00:00"
}
```

### checkins

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "habit_id": "ObjectId",
  "date": "2024-01-01",
  "completed": true,
  "value": 2.0,
  "skipped": false,
  "created_at": "2024-01-01T00:00:00"
}
```

### streaks

```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "habit_id": "ObjectId",
  "current_streak": 5,
  "best_streak": 10,
  "last_checkin_date": "2024-01-05",
  "updated_at": "2024-01-05T00:00:00"
}
```

## Индексы

Рекомендуемые индексы для оптимизации:

```javascript
db.habits.createIndex({ "user_id": 1, "archived": 1 })
db.checkins.createIndex({ "user_id": 1, "habit_id": 1, "date": 1 })
db.checkins.createIndex({ "user_id": 1, "date": 1 })
db.streaks.createIndex({ "user_id": 1, "habit_id": 1 })
```
