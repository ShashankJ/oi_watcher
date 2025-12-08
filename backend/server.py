from flask import Flask, jsonify, request
from flask_cors import CORS
from logger_config import get_logger

from data_fetcher import fetch_intraday_data_without_filter, get_nifty_50_price, select_option_contracts, process_oi_data
from find_support_resistance_niftyfifty_daily import get_support_resistance
from indicator_utils import calculate_stochrsi

# Get logger instance
logger = get_logger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes


@app.route('/api/oi_data', methods=['GET'])
def get_oi_data():
    nifty_price = get_nifty_50_price()
    selected_calls, selected_puts = select_option_contracts(nifty_price)

    call_oi_data = process_oi_data(selected_calls)
    put_oi_data = process_oi_data(selected_puts)

    total_put_oi_change = sum(data['oi_change'] for data in put_oi_data.values())
    total_call_oi_change = sum(data['oi_change'] for data in call_oi_data.values())

    total_put = sum(data['latest_oi'] for data in put_oi_data.values())
    total_call = sum(data['latest_oi'] for data in call_oi_data.values())

    pcr = total_put_oi_change / total_call_oi_change if total_call_oi_change != 0 else 0

    response_data = {
        "total_put_oi": total_put,
        "total_call_oi": total_call,
        "Call OI Change": total_call_oi_change,
        "Put OI Change": total_put_oi_change,
        "Nifty Price": nifty_price,
        "calls": list(call_oi_data.values()),
        "puts": list(put_oi_data.values()),
        "pcr": pcr
    }

    return jsonify(response_data)


@app.route('/support_resistance', methods=['GET'])
def support_resistance():
    try:
        interval = int(request.args.get('interval'))
        unit = request.args.get('unit')
        result = get_support_resistance(interval, unit)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.get("/stochrsi_nifty50_5m")
def get_stochrsi_nifty50_5m():
    candles = fetch_intraday_data_without_filter('NSE_INDEX|Nifty 50')
    stochrsi = calculate_stochrsi(candles)
    if stochrsi is None:
        return {"error": "Not enough data to calculate Stochastic RSI"}
    # Analysis
    if stochrsi > 0.8:
        analysis = "Overbought: Possible reversal"
    elif stochrsi < 0.2:
        analysis = "Oversold: Possible reversal"
    else:
        analysis = "Neutral"
    return {
        "stochrsi": stochrsi,
        "analysis": analysis
    }


@app.route('/api/nifty_curr', methods=['GET'])
def get_nifty_current():
    """
    Get current Nifty price with change and change percentage from previous day
    """
    try:
        # Fetch intraday candles for Nifty 50
        candles = fetch_intraday_data_without_filter('NSE_INDEX|Nifty 50')

        if not candles or len(candles) < 2:
            return jsonify({'error': 'Not enough data available'}), 400

        # Latest candle (most recent)
        latest_candle = candles[0]
        ltp = latest_candle[4]  # Close price

        # Get previous day's close (first candle of today vs last candle of yesterday)
        # Assuming candles are sorted with newest first
        previous_close = candles[-1][4]  # Close price of oldest candle (previous day close)

        # Calculate change and change percentage
        change = ltp - previous_close
        change_percent = (change / previous_close) * 100 if previous_close != 0 else 0

        logger.info(f"Nifty current: LTP={ltp}, Change={change}, Change%={change_percent}")

        return jsonify({
            "ltp": round(ltp, 2),
            "change": round(change, 2),
            "change_percent": round(change_percent, 2)
        })
    except Exception as e:
        logger.error(f"Error fetching Nifty current price: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500


@app.route('/api/nifty_previous_day', methods=['GET'])
def get_nifty_previous_day():
    """
    Get previous day OHLC data for Nifty 50
    """
    try:
        candles = fetch_intraday_data_without_filter('NSE_INDEX|Nifty 50')

        if not candles or len(candles) < 2:
            return jsonify({'error': 'Not enough data available'}), 400

        # Get yesterday's candle (assuming daily data or aggregate from intraday)
        # For simplicity, using the oldest available candle as reference
        prev_candle = candles[-1]

        return jsonify({
            "date": prev_candle[0],  # Timestamp
            "open": round(prev_candle[1], 2),
            "high": round(prev_candle[2], 2),
            "low": round(prev_candle[3], 2),
            "close": round(prev_candle[4], 2)
        })
    except Exception as e:
        logger.error(f"Error fetching previous day OHLC: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
