import requests
import gzip
import json
import io
from functools import lru_cache
import numpy as np
import datetime

INSTRUMENTS_URL = "https://assets.upstox.com/market-quote/instruments/exchange/NSE.json.gz"

@lru_cache(maxsize=1)
def get_nifty_50_instrument_key():
    """
    Downloads the instruments file from Upstox, finds the instrument key for Nifty 50,
    and caches the result.
    """
    try:
        response = requests.get(INSTRUMENTS_URL)
        response.raise_for_status()

        gzip_file = io.BytesIO(response.content)
        with gzip.open(gzip_file, 'rt') as f:
            instruments = json.load(f)

        for instrument in instruments:
            if (instrument.get('name') == 'Nifty 50' and
                instrument.get('instrument_type') == 'INDEX' and
                instrument.get('segment') == 'NSE_INDEX'):
                return instrument.get('instrument_key')

        return None
    except requests.exceptions.RequestException as e:
        print(f"Error downloading instruments file: {e}")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None


# Placeholder for upstox_client. Replace with actual client usage.
def fetch_nifty50_5m_candles():
    """
    Fetch 5-minute candles for Nifty 50 using upstox_client. If intraday returns zero candles,
    fallback to historical data for previous 6 days and get latest day data.
    Returns: list of dicts with 'close' prices and 'timestamp'.
    """
    # This is a placeholder. Replace with actual upstox_client usage.
    # Simulate intraday API returning zero candles
    candles = []
    if not candles:
        # Fallback: fetch historical data for previous 6 days
        # Simulate 6 days of 5-min candles (e.g., 78 candles per day)
        now = datetime.datetime.now()
        candles = []
        for day in range(6):
            for i in range(78):
                candles.append({
                    'timestamp': (now - datetime.timedelta(days=day, minutes=5*i)).isoformat(),
                    'close': 24000 + np.random.randn() * 100
                })
        # Get only the latest day's candles
        latest_day = max(c['timestamp'][:10] for c in candles)
        candles = [c for c in candles if c['timestamp'].startswith(latest_day)]
    return candles




if __name__ == '__main__':
    # Example usage
    nifty_key = get_nifty_50_instrument_key()
    if nifty_key:
        print(f"Nifty 50 Instrument Key: {nifty_key}")
    else:
        print("Could not retrieve Nifty 50 instrument key.")
