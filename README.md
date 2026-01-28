# Habitify Clone

Полноценный клон Habitify.me - приложения для трекинга привычек и саморазвития.

## Технологии

### Frontend
- React 18 + TypeScript
- Vite
- Redux Toolkit
- React Router
- Tailwind CSS + shadcn/ui
- FSD (Feature-Sliced Design)

### Backend
- Python 3.11+
- FastAPI
- MongoDB
- JWT аутентификация

## Запуск

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker-compose up -d
```

## Структура проекта

- `frontend/` - React приложение (FSD архитектура)
- `backend/` - FastAPI приложение
- `docs/` - Документация
