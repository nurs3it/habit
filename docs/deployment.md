# Deployment Guide

## Локальная разработка

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend будет доступен на `http://localhost:8000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend будет доступен на `http://localhost:3000`

### Docker

```bash
docker-compose up -d
```

Это запустит MongoDB и Backend в контейнерах.

## Environment Variables

### Backend

Создать `.env` файл в `backend/`:

```
MONGODB_URL=mongodb://admin:password@localhost:27017/?authSource=admin
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend

Frontend использует proxy в `vite.config.ts` для API запросов.

## Production

### Backend

1. Установить зависимости: `pip install -r requirements.txt`
2. Настроить environment variables
3. Запустить с uvicorn: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

### Frontend

1. Собрать проект: `npm run build`
2. Развернуть `dist/` директорию на статический хостинг (Nginx, Vercel, etc.)

### MongoDB

Использовать MongoDB Atlas для production или настроить свой MongoDB сервер.

## Docker Production

Создать `docker-compose.prod.yml` для production окружения с правильными environment variables.
