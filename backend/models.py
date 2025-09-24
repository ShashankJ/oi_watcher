from sqlalchemy import Column, Integer, String, Float, DateTime
from .database import Base
import datetime

class OptionData(Base):
    __tablename__ = "option_data"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    instrument_key = Column(String, index=True)
    strike_price = Column(Float)
    option_type = Column(String)  # 'CE' or 'PE'
    ltp = Column(Float)
    oi = Column(Float)
    change_in_oi = Column(Float)
