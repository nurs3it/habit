# Deployment to Fly.io

## Prerequisites

1. Install [flyctl](https://fly.io/docs/getting-started/installing-flyctl/)
2. Login: `flyctl auth login`
3. Create app: `flyctl apps create habittracker` (or use existing name)

## Setup

1. **Set environment variables**:
   ```bash
   flyctl secrets set MONGODB_URL="your-mongodb-connection-string"
   flyctl secrets set SECRET_KEY="your-secret-key"
   flyctl secrets set ALGORITHM="HS256"
   flyctl secrets set ACCESS_TOKEN_EXPIRE_MINUTES="30"
   flyctl secrets set CORS_ORIGINS='["https://habittracker.fly.dev"]'
   ```

2. **Deploy**:
   ```bash
   flyctl deploy
   ```

## MongoDB

You can use:
- MongoDB Atlas (cloud)
- Fly.io Postgres (if you migrate)
- Self-hosted MongoDB

For MongoDB Atlas, get connection string and set `MONGODB_URL` secret.

## Notes

- The Dockerfile builds frontend and serves it through FastAPI
- All requests go through port 8000
- Frontend is served at `/` and API at `/api/v1/*`
- Update `fly.toml` `app` name to match your app name
