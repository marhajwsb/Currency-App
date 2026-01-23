from fastapi import FastAPI
from app.api import currencies
from app.db.session import engine
from app.db.base import Base

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Currency App API")

app.include_router(currencies.router)
