import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from app.core.config import settings

client: Optional[AsyncIOMotorClient] = None
database = None


async def connect_to_mongo():
    global client, database
    connect_kwargs = {}
    if settings.MONGODB_USE_TLS or settings.MONGODB_URL.startswith("mongodb+srv://"):
        connect_kwargs["tlsCAFile"] = certifi.where()
    client = AsyncIOMotorClient(settings.MONGODB_URL, **connect_kwargs)
    database = client.get_database("habittracker")


async def close_mongo_connection():
    global client
    if client:
        client.close()


def get_database():
    return database
