from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import currencies
from app.repositories.base import Base
from app.repositories.session import engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Currency Rates API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(currencies.router)

@app.get("/")
def health_check():
    return {"status": "running"}