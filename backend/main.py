import asyncio
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
import upstox_api
import database
import models
import crud
from decouple import config

app = FastAPI()

# Configuration
ACCESS_TOKEN = config('UPSTOX_ACCESS_TOKEN')
EXPIRY_DATE = config('EXPIRY_DATE')
POLLING_INTERVAL = config('POLLING_INTERVAL', default=300, cast=int)

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
    The background task that polls data from the Upstox API and stores it in the database.
    """
    while True:
        print("Polling data...")
        nifty_key = upstox_api.get_nifty_50_instrument_key()
        if not nifty_key:
            print("Could not get Nifty 50 instrument key. Skipping poll.")
            await asyncio.sleep(POLLING_INTERVAL)
            continue

        if not ACCESS_TOKEN or not EXPIRY_DATE:
            print("Access token or expiry date not set. Skipping poll.")
            await asyncio.sleep(POLLING_INTERVAL)
            continue

        option_chain = upstox_api.get_option_chain(nifty_key, EXPIRY_DATE, ACCESS_TOKEN)
        if not option_chain or 'data' not in option_chain:
            print("Could not get option chain. Skipping poll.")
            await asyncio.sleep(POLLING_INTERVAL)
            continue

        spot_price = option_chain['data'][0].get('underlying_spot_price')
        if not spot_price:
            print("Could not determine spot price. Skipping poll.")
            await asyncio.sleep(POLLING_INTERVAL)
            continue

        # Find ATM strike
        atm_strike = min(option_chain['data'], key=lambda x: abs(x['strike_price'] - spot_price))

        # Get all strikes and sort them
        all_strikes = sorted([item['strike_price'] for item in option_chain['data']])
        atm_strike_index = all_strikes.index(atm_strike['strike_price'])

        # Select 5 strikes above and 5 below
        start_index = max(0, atm_strike_index - 5)
        end_index = min(len(all_strikes), atm_strike_index + 6)
        selected_strikes = all_strikes[start_index:end_index]

        option_data_to_save = []
        for item in option_chain['data']:
            if item['strike_price'] in selected_strikes:
                # Call option
                if 'call_options' in item and item['call_options']:
                    call_data = item['call_options']['market_data']
                    option_data_to_save.append(models.OptionData(
                        instrument_key=item['call_options']['instrument_key'],
                        strike_price=item['strike_price'],
                        option_type='CE',
                        ltp=call_data.get('ltp', 0),
                        oi=call_data.get('oi', 0),
                        change_in_oi=call_data.get('oi', 0) - call_data.get('prev_oi', 0)
                    ))
                # Put option
                if 'put_options' in item and item['put_options']:
                    put_data = item['put_options']['market_data']
                    option_data_to_save.append(models.OptionData(
                        instrument_key=item['put_options']['instrument_key'],
                        strike_price=item['strike_price'],
                        option_type='PE',
                        ltp=put_data.get('ltp', 0),
                        oi=put_data.get('oi', 0),
                        change_in_oi=put_data.get('oi', 0) - put_data.get('prev_oi', 0)
                    ))

        if option_data_to_save:
            db = database.SessionLocal()
            crud.save_option_data(db, option_data_to_save)
            db.close()
            print(f"Saved {len(option_data_to_save)} records to the database.")

        await asyncio.sleep(POLLING_INTERVAL)


@app.on_event("startup")
async def startup_event():
    asyncio.create_task(poll_data())


@app.get("/")
def read_root():
    return {"message": "Welcome to the OI Watcher API"}

@app.get("/nifty-instrument-key")
def get_nifty_key():
    """
    An endpoint to test the retrieval of the Nifty 50 instrument key.
    """
    nifty_key = upstox_api.get_nifty_50_instrument_key()
    if nifty_key:
        return {"instrument_key": nifty_key}
    else:
        return {"error": "Could not retrieve Nifty 50 instrument key"}

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
