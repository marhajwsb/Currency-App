from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete
from sqlalchemy.orm import Session
from typing import List
from datetime import date
from app.models.currency import CurrencyRate
from app.schemas.currency import CurrencyBase
from app.services.nbp_client import NBPClient
from app.repositories.session import get_db

router = APIRouter(prefix="/currencies", tags=["currencies"])
nbp_service = NBPClient()

@router.get("/", response_model=List[CurrencyBase])
def get_all_rates(db: Session = Depends(get_db)):
    return db.query(CurrencyRate).all()

@router.get("/{date_val}", response_model=List[CurrencyBase])
def get_rates_by_date(date_val: date, db: Session = Depends(get_db)):
    rates = db.query(CurrencyRate).filter(CurrencyRate.date == date_val).all()
    if not rates:
        raise HTTPException(status_code=404, detail="No data for this date in local DB")
    return rates

@router.post("/fetch")
async def fetch_and_save(target_date: date, db: Session = Depends(get_db)):
    rates_data = await nbp_service.fetch_rates_for_date(target_date)
    
    if not rates_data:
        return {"message": "No data available from NBP for this date."}

    db.execute(delete(CurrencyRate).where(CurrencyRate.date == target_date))

    for item in rates_data:
        new_rate = CurrencyRate(
            code=item['code'],
            rate=item['mid'],
            date=target_date
        )
        db.add(new_rate)
    
    db.commit()
    return {"message": f"Successfully fetched {len(rates_data)} rates for {target_date}"}