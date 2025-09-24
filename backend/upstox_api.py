import requests
import gzip
import json
import io
from functools import lru_cache

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

if __name__ == '__main__':
    # Example usage
    nifty_key = get_nifty_50_instrument_key()
    if nifty_key:
        print(f"Nifty 50 Instrument Key: {nifty_key}")
    else:
        print("Could not retrieve Nifty 50 instrument key.")
