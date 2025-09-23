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

def get_option_chain(instrument_key: str, expiry_date: str, access_token: str):
    """
    Fetches the option chain for a given instrument and expiry date.
    """
    url = f"https://api.upstox.com/v2/option/chain"
    headers = {
        'Accept': 'application/json',
        'Authorization': f'Bearer {access_token}'
    }
    params = {
        'instrument_key': instrument_key,
        'expiry_date': expiry_date
    }
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching option chain: {e}")
        return None

if __name__ == '__main__':
    # Example usage (will not work without a valid access token)
    nifty_key = get_nifty_50_instrument_key()
    if nifty_key:
        print(f"Nifty 50 Instrument Key: {nifty_key}")
        # You would need a valid access token and expiry date to test the next part
        # access_token = "your_access_token"
        # expiry_date = "2024-12-26" # Example expiry
        # option_chain = get_option_chain(nifty_key, expiry_date, access_token)
        # if option_chain:
        #     print(json.dumps(option_chain, indent=2))
    else:
        print("Could not retrieve Nifty 50 instrument key.")
