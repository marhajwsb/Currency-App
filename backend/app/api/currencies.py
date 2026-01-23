from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.currency import Currency

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/currencies")
def get_currencies(db: Session = Depends(get_db)):
    return db.query(Currency.currency_code).distinct().all()

@router.get("/currencies/{date}")
def get_currencies_by_date(date: str, db: Session = Depends(get_db)):
    return db.query(Currency).filter(Currency.date==date).all()

@router.post("/currencies/fetch")
def fetch_currencies():
    # tutaj będzie logika pobierania danych z NBP
    return {"message": "Dane pobrane"}
