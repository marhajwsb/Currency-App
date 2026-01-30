from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import delete
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, timedelta
from app.models.currency import CurrencyRate
from app.schemas.currency import CurrencyBase
from app.services.nbp_client import NBPClient
from app.repositories.session import get_db

router = APIRouter(prefix="/currencies", tags=["currencies"])
nbp_service = NBPClient()

@router.get("/", response_model=List[CurrencyBase])
def get_all_rates(db: Session = Depends(get_db)):
    return db.query(CurrencyRate).order_by(CurrencyRate.date.desc()).all()


@router.get("/{date_val}", response_model=List[CurrencyBase])
def get_rates_by_date(date_val: date, db: Session = Depends(get_db)):
    rates = db.query(CurrencyRate).filter(CurrencyRate.date == date_val).all()
    if not rates:
        raise HTTPException(
            status_code=404, 
            detail=f"No data for date {date_val} in local database"
        )
    return rates


@router.post("/fetch")
async def fetch_and_save(
    start_date: date = Query(..., description="Data początkowa (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="Data końcowa (YYYY-MM-DD), domyślnie = start_date"),
    db: Session = Depends(get_db)
):
    if end_date is None:
        end_date = start_date
    
    if start_date > end_date:
        raise HTTPException(
            status_code=400, 
            detail="start_date cannot be after end_date"
        )
    
    date_diff = (end_date - start_date).days
    if date_diff > 93:
        raise HTTPException(
            status_code=400,
            detail=f"Date range too large ({date_diff} days). NBP API allows maximum 93 days."
        )
    
    today = date.today()
    if start_date > today:
        raise HTTPException(
            status_code=400,
            detail=f"start_date cannot be in the future (today is {today})"
        )
    
    try:
        tables_data = await nbp_service.fetch_rates_range(start_date, end_date)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error while fetching from NBP: {str(e)}"
        )
    
    if not tables_data:
        return {
            "message": f"No data available from NBP for range {start_date} to {end_date}",
            "days_processed": 0,
            "total_records": 0
        }

    total_added = 0
    dates_processed = []

    for table in tables_data:
        effective_date_raw = table.get('effectiveDate')
        
        if not effective_date_raw:
            continue
        
        if isinstance(effective_date_raw, str):
            current_effective_date = date.fromisoformat(effective_date_raw)
        else:
            current_effective_date = effective_date_raw

        db.execute(
            delete(CurrencyRate).where(CurrencyRate.date == current_effective_date)
        )
        
        for item in table.get('rates', []):
            new_rate = CurrencyRate(
                code=item['code'],
                rate=item['mid'],
                date=current_effective_date
            )
            db.add(new_rate)
            total_added += 1
        
        dates_processed.append(current_effective_date)
    
    db.commit()
    
    return {
        "message": f"Successfully fetched rates from {start_date} to {end_date}",
        "days_processed": len(tables_data),
        "total_records": total_added,
        "dates_processed": dates_processed
    }


@router.delete("/clear")
def clear_all_rates(db: Session = Depends(get_db)):
    deleted_count = db.query(CurrencyRate).delete()
    db.commit()
    return {
        "message": "All currency rates deleted",
        "deleted_count": deleted_count
    }