# API Documentation

## Base URL

```
http://localhost:8000/api/v1
```

## Authentication

Все защищённые эндпоинты требуют JWT токен в заголовке:

```
Authorization: Bearer <token>
```

## Endpoints

### Auth

#### POST /auth/register

Регистрация нового пользователя.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "settings": {
    "theme": "light",
    "notifications_enabled": true
  }
}
```

#### POST /auth/login

Вход в систему.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "jwt_token",
  "token_type": "bearer"
}
```

#### GET /auth/me

Получение информации о текущем пользователе.

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "settings": {
    "theme": "light",
    "notifications_enabled": true
  }
}
```

### Habits

#### GET /habits

Получение списка привычек.

**Query Parameters:**
- `archived` (boolean, optional): Фильтр по архивированным привычкам

**Response:**
```json
[
  {
    "id": "habit_id",
    "user_id": "user_id",
    "name": "Drink water",
    "type": "positive",
    "frequency": "daily",
    "color": "#3B82F6",
    "order": 0,
    "archived": false
  }
]
```

#### POST /habits

Создание новой привычки.

**Request:**
```json
{
  "name": "Drink water",
  "type": "positive",
  "frequency": "daily",
  "start_date": "2024-01-01T00:00:00",
  "color": "#3B82F6"
}
```

#### PUT /habits/{id}

Обновление привычки.

#### DELETE /habits/{id}

Удаление привычки.

#### POST /habits/{id}/archive

Архивация привычки.

### Checkins

#### POST /checkins

Создание чек-ина.

**Request:**
```json
{
  "habit_id": "habit_id",
  "date": "2024-01-01",
  "completed": true
}
```

#### GET /checkins/today

Получение чек-инов на сегодня.

#### DELETE /checkins/{id}

Удаление чек-ина.

### Analytics

#### GET /analytics/habits/{id}

Аналитика по конкретной привычке.

**Query Parameters:**
- `days` (int, optional): Количество дней для анализа (по умолчанию 30)

#### GET /analytics/heatmap

Тепловая карта активности.

**Query Parameters:**
- `days` (int, optional): Количество дней (по умолчанию 365)

#### GET /analytics/insights

Инсайты и паттерны.
