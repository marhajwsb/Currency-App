from fastapi import FastAPI
from app.api import currencies

app = FastAPI(title="Currency App API")

app.include_router(currencies.router)
