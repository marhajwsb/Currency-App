from sqlalchemy import Column, Integer, String, Numeric, Date
from app.db.session import Base

class Currency(Base):
    __tablename__ = "currencies"

    id = Column(Integer, primary_key=True, index=True)
    currency_code = Column(String(3), index=True)
    currency_name = Column(String(100))
    rate = Column(Numeric(10, 4))
    date = Column(Date)

    year = Column(Integer)
    quarter = Column(Integer)
    month = Column(Integer)
