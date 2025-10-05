from flask import Flask, jsonify, request
from data_fetcher import get_nifty_50_price, select_option_contracts, process_oi_data
from find_support_resistance_niftyfifty_daily import get_support_resistance

app = Flask(__name__)


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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)