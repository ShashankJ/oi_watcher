import numpy as np


def calculate_stochrsi(candles, period=14):
    """
    Calculate Stochastic RSI from a list of candle dicts with 'close' prices.
    Returns the latest Stochastic RSI value (0-1 float).
    """
    closes = [c[4] for c in candles['data']['candles']]
    if len(closes) < period * 2:
        return None
    # Calculate RSI
    deltas = np.diff(closes)
    seed = deltas[:period+1]
    up = seed[seed >= 0].sum()/period
    down = -seed[seed < 0].sum()/period
    rs = up/down if down != 0 else 0
    rsi = np.zeros_like(closes)
    rsi[:period] = 100. - 100./(1.+rs)
    for i in range(period, len(closes)):
        delta = deltas[i-1]
        if delta > 0:
            upval = delta
            downval = 0.
        else:
            upval = 0.
            downval = -delta
        up = (up*(period-1) + upval)/period
        down = (down*(period-1) + downval)/period
        rs = up/down if down != 0 else 0
        rsi[i] = 100. - 100./(1.+rs)
    # Calculate Stochastic RSI
    stochrsi = np.zeros_like(rsi)
    for i in range(period, len(rsi)):
        min_rsi = np.min(rsi[i-period+1:i+1])
        max_rsi = np.max(rsi[i-period+1:i+1])
        stochrsi[i] = (rsi[i] - min_rsi) / (max_rsi - min_rsi) if max_rsi != min_rsi else 0
    return float(stochrsi[-1])
