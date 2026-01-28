# Архитектура Habitify Clone

## Обзор

Полноценный клон Habitify.me с mobile-first дизайном, включающий frontend на React + TypeScript и backend на FastAPI + MongoDB.

## Структура проекта

```
habittracker/
├── frontend/          # React приложение (FSD архитектура)
├── backend/           # FastAPI приложение
├── docs/              # Документация
└── .cursor/rules/     # Правила для Cursor
```

## Frontend (FSD)

### Слои

- **app/** - Инициализация, провайдеры, роутинг
- **shared/** - Переиспользуемые компоненты, утилиты, API клиент
- **entities/** - Бизнес-сущности (habit, user, checkin, streak)
- **features/** - Фичи (create-habit, check-in, analytics)
- **widgets/** - Композиция фич (today-screen, habits-list)

### Технологии

- React 18 + TypeScript
- Redux Toolkit для state management
- React Router для навигации
- Tailwind CSS + shadcn/ui для стилей
- Axios для HTTP запросов

## Backend

### Структура

- **app/api/v1/** - API роуты
- **app/core/** - Конфигурация, security, database
- **app/models/** - MongoDB модели (Pydantic)
- **app/schemas/** - Pydantic схемы для валидации
- **app/services/** - Бизнес-логика (streak service)

### Технологии

- FastAPI
- MongoDB (Motor async driver)
- JWT для аутентификации
- Pydantic для валидации

## API Endpoints

### Auth
- POST `/api/v1/auth/register` - Регистрация
- POST `/api/v1/auth/login` - Вход
- GET `/api/v1/auth/me` - Текущий пользователь

### Habits
- GET `/api/v1/habits` - Список привычек
- POST `/api/v1/habits` - Создание
- GET `/api/v1/habits/{id}` - Детали
- PUT `/api/v1/habits/{id}` - Обновление
- DELETE `/api/v1/habits/{id}` - Удаление
- PATCH `/api/v1/habits/{id}/order` - Изменение порядка
- POST `/api/v1/habits/{id}/archive` - Архивация

### Checkins
- POST `/api/v1/checkins` - Создание чек-ина
- GET `/api/v1/checkins` - История
- GET `/api/v1/checkins/today` - Чек-ины на сегодня
- DELETE `/api/v1/checkins/{id}` - Удаление

### Analytics
- GET `/api/v1/analytics/habits/{id}` - Аналитика по привычке
- GET `/api/v1/analytics/heatmap` - Тепловая карта
- GET `/api/v1/analytics/insights` - Инсайты

## База данных (MongoDB)

### Коллекции

- **users** - Пользователи
- **habits** - Привычки
- **checkins** - Выполнения
- **streaks** - Стрики
- **reminders** - Напоминания (будущее)
- **routines** - Рутины (будущее)

## Аутентификация

JWT токены с истечением через 30 минут. Токен хранится в localStorage на frontend.
