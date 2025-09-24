from flask import Flask, jsonify
from data_fetcher import get_nifty_50_price, select_option_contracts, process_oi_data

app = Flask(__name__)

@app.route('/api/oi_data', methods=['GET'])
def get_oi_data():
    nifty_price = get_nifty_50_price()
    selected_calls, selected_puts = select_option_contracts(nifty_price)

    call_oi_data = process_oi_data(selected_calls)
    put_oi_data = process_oi_data(selected_puts)

    total_put_oi_change = sum(data['oi_change'] for data in put_oi_data.values())
    total_call_oi_change = sum(data['oi_change'] for data in call_oi_data.values())

    pcr = total_put_oi_change / total_call_oi_change if total_call_oi_change != 0 else 0

    response_data = {
        "calls": list(call_oi_data.values()),
        "puts": list(put_oi_data.values()),
        "pcr": pcr
    }

    return jsonify(response_data)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)