import asyncio
import json
from datetime import datetime
import random
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import database
import models
import crud
from decouple import config
from fastapi.middleware.cors import CORSMiddleware
from upstox_api import fetch_nifty50_5m_candles, calculate_stochrsi

app = FastAPI()

# Configuration
EXPIRY_DATE = config('EXPIRY_DATE')
POLLING_INTERVAL = config('POLLING_INTERVAL', default=300, cast=int)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create the database and tables on startup
database.create_db_and_tables()

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def poll_data():
    """
    The background task that polls data and stores it in the database.
    """
    while True:
        print("Polling data...")
        # Hardcoded spot price as we cannot fetch live data without an access token
        spot_price = 25000

        with open('NSE_FO.json', 'r') as f:
            all_options = json.load(f)

        # Filter options by expiry date
        expiry_datetime = datetime.strptime(EXPIRY_DATE, '%Y-%m-%d')
        filtered_options = [
            opt for opt in all_options
            if datetime.fromtimestamp(opt['expiry'] / 1000).date() == expiry_datetime.date()
        ]

        if not filtered_options:
            print(f"No options found for expiry date {EXPIRY_DATE}. Skipping poll.")
            await asyncio.sleep(POLLING_INTERVAL)
            continue

        # Get all unique strikes and sort them
        all_strikes = sorted(list(set(opt['strike_price'] for opt in filtered_options)))

        # Find ATM strike
        atm_strike = min(all_strikes, key=lambda x: abs(x - spot_price))
        atm_strike_index = all_strikes.index(atm_strike)

        # Select 5 strikes above and 5 below
        start_index = max(0, atm_strike_index - 5)
        end_index = min(len(all_strikes), atm_strike_index + 6)
        selected_strikes = all_strikes[start_index:end_index]

        db = database.SessionLocal()
        try:
            option_data_to_save = []
            for strike in selected_strikes:
                # Find the CE and PE options for the current strike
                ce_option = next((opt for opt in filtered_options if opt['strike_price'] == strike and opt['instrument_type'] == 'CE'), None)
                pe_option = next((opt for opt in filtered_options if opt['strike_price'] == strike and opt['instrument_type'] == 'PE'), None)

                if ce_option:
                    prev_oi = crud.get_previous_oi(db, ce_option['instrument_key'])
                    current_oi = random.randint(1000, 100000)
                    option_data_to_save.append(models.OptionData(
                        instrument_key=ce_option['instrument_key'],
                        strike_price=ce_option['strike_price'],
                        option_type='CE',
                        ltp=random.randint(1, 500),
                        oi=current_oi,
                        change_in_oi=current_oi - prev_oi if prev_oi is not None else 0
                    ))
                if pe_option:
                    prev_oi = crud.get_previous_oi(db, pe_option['instrument_key'])
                    current_oi = random.randint(1000, 100000)
                    option_data_to_save.append(models.OptionData(
                        instrument_key=pe_option['instrument_key'],
                        strike_price=pe_option['strike_price'],
                        option_type='PE',
                        ltp=random.randint(1, 500),
                        oi=current_oi,
                        change_in_oi=current_oi - prev_oi if prev_oi is not None else 0
                    ))

            if option_data_to_save:
                crud.save_option_data(db, option_data_to_save)
                print(f"Saved {len(option_data_to_save)} records to the database.")
        finally:
            db.close()

        await asyncio.sleep(POLLING_INTERVAL)


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(poll_data())


@app.get("/")
def read_root():
    return {"message": "Welcome to the OI Watcher API"}


@app.get("/api/v1/option-data")
def get_option_data(db: Session = Depends(get_db)):
    """
    This endpoint retrieves the latest option data from the database,
    processes it, and returns it in a format suitable for the frontend.
    """
    latest_data = crud.get_latest_option_data(db)

    if not latest_data:
        return {"error": "No data available yet."}

    total_call_oi = sum(d.oi for d in latest_data if d.option_type == 'CE')
    total_put_oi = sum(d.oi for d in latest_data if d.option_type == 'PE')

    pcr = total_put_oi / total_call_oi if total_call_oi > 0 else 0

    # Group data by strike price for the bar chart
    oi_by_strike = {}
    for d in latest_data:
        if d.strike_price not in oi_by_strike:
            oi_by_strike[d.strike_price] = {'call_oi': 0, 'put_oi': 0}
        if d.option_type == 'CE':
            oi_by_strike[d.strike_price]['call_oi'] = d.oi
        else:
            oi_by_strike[d.strike_price]['put_oi'] = d.oi

    chart_data = [
        {'strike': strike, **ois} for strike, ois in sorted(oi_by_strike.items())
    ]

    return {
        "contracts": [
            {
                "strike_price": d.strike_price,
                "option_type": d.option_type,
                "ltp": d.ltp,
                "oi": d.oi,
                "change_in_oi": d.change_in_oi
            } for d in latest_data
        ],
        "oi_chart_data": chart_data,
        "pcr": pcr
    }



