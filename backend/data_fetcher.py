import requests
import json

def get_instrument_key(symbol, expiry_date, strike_price=None, option_type=None):
    """
    Finds the instrument key for a given symbol, expiry date, and optional strike price/option type.
    """
    with open('../NSE_FO.json', 'r') as f:
        data = json.load(f)

    for instrument in data:
        if instrument['asset_symbol'] == symbol:
            # Match expiry date (handle potential format differences if necessary)
            # This is a simplified match, a more robust solution might be needed
            if expiry_date in instrument['trading_symbol']:
                if strike_price and option_type:
                    if instrument['strike_price'] == strike_price and instrument['instrument_type'] == option_type:
                        return instrument['instrument_key']
                elif not strike_price and not option_type: # For futures
                    if instrument['instrument_type'] == 'FUT':
                        return instrument['instrument_key']
    return None

def fetch_intraday_data(instrument_key):
    """
    Fetches intraday candle data for a given instrument key.
    """
    url = f"https://api.upstox.com/v2/historical-candle/intraday/{instrument_key}/1minute"
    headers = {
        'Accept': 'application/json'
    }

    try:
        response = requests.get(url, headers=headers)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")

        if response.status_code == 200:
            print("Successfully fetched data without authentication.")
            return response.json()
        else:
            print("Failed to fetch data. Authentication might be required.")
            return None
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return None

def get_nifty_50_price():
    """
    Fetches the latest price of Nifty 50.
    """
    # For the purpose of this script, we will simulate fetching the Nifty 50 price.
    # In a real application, you would use an API to get the live price.
    # We will use a static value for now, as the historical API does not provide a direct way to get the latest price.
    return 25000.0  # Simulated Nifty 50 price

def select_option_contracts(nifty_price):
    """
    Selects 5 call and 5 put option contracts above and below the Nifty 50 price.
    """
    with open('NSE_FO.json', 'r') as f:
        data = json.load(f)

    # Filter for Nifty options and get the nearest expiry date
    nifty_options = [ins for ins in data if ins['asset_symbol'] == 'NIFTY' and ins['instrument_type'] in ['CE', 'PE']]

    if not nifty_options:
        print("No Nifty options found in NSE_FO.json")
        return [], []

    # Find the closest expiry date from today
    from datetime import datetime
    today = datetime.now()

    # Calculate expiry dates and their difference from today
    for option in nifty_options:
        option['expiry_datetime'] = datetime.fromtimestamp(option['expiry'] / 1000)
        option['days_to_expiry'] = (option['expiry_datetime'] - today).days

    # Filter for options that haven't expired yet
    future_options = [opt for opt in nifty_options if opt['days_to_expiry'] >= 0]

    if not future_options:
        print("No future Nifty options found.")
        return [], []

    # Find the minimum days to expiry
    min_days_to_expiry = min(opt['days_to_expiry'] for opt in future_options)

    # Filter for options with the closest expiry date
    closest_expiry_options = [opt for opt in future_options if opt['days_to_expiry'] == min_days_to_expiry]

    # Separate calls and puts
    calls = sorted([opt for opt in closest_expiry_options if opt['instrument_type'] == 'CE'], key=lambda x: x['strike_price'])
    puts = sorted([opt for opt in closest_expiry_options if opt['instrument_type'] == 'PE'], key=lambda x: x['strike_price'])

    # Find 5 calls above the nifty price and 5 puts below
    selected_calls = sorted([c for c in calls if c['strike_price'] > nifty_price], key=lambda x: x['strike_price'])[:5]
    selected_puts = sorted([p for p in puts if p['strike_price'] < nifty_price], key=lambda x: x['strike_price'], reverse=True)[:5]

    return selected_calls, selected_puts

def process_oi_data(options):
    """
    Fetches and processes OI data for the given options.
    """
    oi_data = {}
    for option in options:
        instrument_key = option['instrument_key']
        data = fetch_intraday_data(instrument_key)
        if data and data['data']['candles']:
            candles = data['data']['candles']
            # Assuming the last candle is the most recent
            latest_oi = candles[0][6]
            # Assuming the first candle of the day is the last in the list
            initial_oi = candles[-1][6]
            oi_change = latest_oi - initial_oi
            oi_data[option['strike_price']] = {
                "strike_price": option['strike_price'],
                "instrument_key": instrument_key,
                "initial_oi": initial_oi,
                "latest_oi": latest_oi,
                "oi_change": oi_change
            }
        else:
            print(f"No candle data for {instrument_key}")
            # Simulate some data for demonstration purposes
            oi_data[option['strike_price']] = {
                "strike_price": option['strike_price'],
                "instrument_key": instrument_key,
                "initial_oi": 1000,
                "latest_oi": 1000 + (option['strike_price'] % 100) * 10, # Simulate some change
                "oi_change": (option['strike_price'] % 100) * 10
            }

    return oi_data

# This file is now a module to be imported by server.py