from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import currencies
from app.db.session import engine
from app.db.base import Base


Base.metadata.create_all(bind=engine)


app = FastAPI(
    title="Currency App API",
    description="Backend API do pobierania kursów walut i zapisu do PostgreSQL",
    version="1.0.0"
)


# Konfiguracja CORS
origins = [
    "http://localhost:80",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(currencies.router)
