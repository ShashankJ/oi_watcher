from fastapi import FastAPI, Query
from pydantic import BaseModel
import numpy as np
import upstox_client
import datetime
import logging

# Pivot window size (left/right of center bar)
LEFT = 15
RIGHT = 15

app = FastAPI()


class SupportResistanceResult(BaseModel):
    supports: list
    resistances: list
    trade_zone: str


def get_support_resistance(interval: int, unit: str):
    try:
        api_client = upstox_client.HistoryV3Api()
        today_date = datetime.datetime.today().strftime('%Y-%m-%d')
        days_interval = 30
        if unit == 'days':
            days_interval = 365
        start_date = (datetime.datetime.today() - datetime.timedelta(days=days_interval)).strftime('%Y-%m-%d')
        # Ensure unit is correct for API
        valid_units = ["minutes", "days"]
        if unit not in valid_units:
            raise ValueError(f"Invalid unit: {unit}. Must be one of {valid_units}")
        raw_data = api_client.get_historical_candle_data1("NSE_INDEX|Nifty 50", unit, interval, today_date, start_date)
        if not hasattr(raw_data, 'data') or not hasattr(raw_data.data, 'candles'):
            raise ValueError("No candle data returned from API")
        data = raw_data.data.candles
        if not data:
            raise ValueError("Empty candle data returned from API")
        dates = [x[0] for x in data]
        highs = np.array([x[2] for x in data])
        lows = np.array([x[3] for x in data])

        def is_pivot_high(idx):
            if idx < LEFT or idx + RIGHT >= len(highs):
                return False
            return highs[idx] == max(highs[idx - LEFT:idx + RIGHT + 1])

        def is_pivot_low(idx):
            if idx < LEFT or idx + RIGHT >= len(lows):
                return False
            return lows[idx] == min(lows[idx - LEFT:idx + RIGHT + 1])

        resistances = [(dates[i], float(highs[i])) for i in range(len(highs)) if is_pivot_high(i)]
        supports = [(dates[i], float(lows[i])) for i in range(len(lows)) if is_pivot_low(i)]

        current_price = highs[-1]  # or use close price if available

        trade_zone = check_trade_zone(current_price, supports, resistances)
        api_client.api_client.__del__()
        return {
            "supports": supports,
            "resistances": resistances,
            "trade_zone": trade_zone
        }
    except Exception as e:
        logging.exception("Error in get_support_resistance")
        return {"error": str(e)}


def check_trade_zone(current_price1, supports1, resistances1, tolerance=5):
    for _, support in supports1:
        if abs(current_price1 - support) <= tolerance:
            return "on support"
    for _, resistance in resistances1:
        if abs(current_price1 - resistance) <= tolerance:
            return "on resistance"
    return "no trade"

