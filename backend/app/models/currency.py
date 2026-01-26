from sqlalchemy import Column, Integer, String, Float, Date

from app.repositories.base import Base

class CurrencyRate(Base):
    __tablename__ = "currency_rates"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(3), index=True)
    rate = Column(Float)
    date = Column(Date, index=True)