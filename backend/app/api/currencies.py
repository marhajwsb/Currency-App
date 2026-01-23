from datetime import date
from app.services.date_utils import calculate_quarter
from app.services.nbp_client import fetch_rates_for_date
from fastapi import APIRouter, Depends
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
    return db.query(Currency).filter(Currency.date == date).all()

@router.post("/currencies/fetch")
def fetch_currencies(db: Session = Depends(get_db)):
    today = date.today()

    rates = fetch_rates_for_date(today)

    saved = 0
    for rate in rates:
        currency = Currency(
            currency_code=rate["code"],
            currency_name=rate["currency"],
            rate=rate["mid"],
            date=today,
            year=today.year,
            month=today.month,
            quarter=calculate_quarter(today.month)
        )
        db.add(currency)
        saved += 1

    db.commit()

    return {
        "message": "Currencies fetched and saved",
        "date": str(today),
        "saved_records": saved
    }