import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime
import warnings

import upstox_client

warnings.filterwarnings('ignore')


def calculate_smma(data, period):
    """Calculate Smoothed Moving Average (SMMA/RMA)"""
    smma = pd.Series(index=data.index, dtype=float)
    smma.iloc[period - 1] = data.iloc[:period].mean()

    for i in range(period, len(data)):
        smma.iloc[i] = (smma.iloc[i - 1] * (period - 1) + data.iloc[i]) / period

    return smma


def load_data_from_csv(filepath):
    """Load data from CSV file"""
    df = pd.read_csv(filepath, parse_dates=['Date'], index_col='Date')
    return df


def generate_sample_data(start='2020-01-01', end='2024-12-09', initial_price=10000):
    """Generate sample price data for testing (simulates crypto-like volatility)"""
    date_range = pd.date_range(start=start, end=end, freq='D')

    # Generate random walk with trend
    np.random.seed(42)
    returns = np.random.normal(0.001, 0.03, len(date_range))
    prices = initial_price * (1 + returns).cumprod()

    df = pd.DataFrame({
        'Open': prices * (1 + np.random.uniform(-0.02, 0.02, len(prices))),
        'High': prices * (1 + np.random.uniform(0, 0.05, len(prices))),
        'Low': prices * (1 - np.random.uniform(0, 0.05, len(prices))),
        'Close': prices,
        'Volume': np.random.uniform(1e6, 1e8, len(prices))
    }, index=date_range)

    return df


def backtest_smma_cross(df=None, csv_path=None, use_sample=True,
                        fast_period=5, slow_period=13, initial_capital=10000):
    """
    Backtest SMMA crossover strategy

    Parameters:
    - df: DataFrame with OHLCV data (optional)
    - csv_path: path to CSV file with OHLCV data (optional)
    - use_sample: if True, generate sample data (default)
    - fast_period: fast SMMA period (default 5)
    - slow_period: slow SMMA period (default 13)
    - initial_capital: starting capital

    CSV format should have columns: Date, Open, High, Low, Close, Volume
    """

    # Load data
    if df is None:
        if csv_path:
            print(f"Loading data from {csv_path}...")
            df = load_data_from_csv(csv_path)
        elif use_sample:
            print("Generating sample data...")
            df = generate_sample_data()
        else:
            print("Error: No data source provided")
            return

    if df.empty:
        print("No data available")
        return

    print(f"Data loaded: {len(df)} rows from {df.index[0]} to {df.index[-1]}")

    # Calculate SMMAs
    df['SMMA_fast'] = calculate_smma(df['Close'], fast_period)
    df['SMMA_slow'] = calculate_smma(df['Close'], slow_period)

    # Generate signals
    df['Signal'] = 0
    df.loc[df['SMMA_fast'] > df['SMMA_slow'], 'Signal'] = 1  # Long
    df.loc[df['SMMA_fast'] <= df['SMMA_slow'], 'Signal'] = -1  # Short/Exit

    # Identify crossovers
    df['Position'] = df['Signal'].diff()

    # Calculate returns
    df['Returns'] = df['Close'].pct_change()
    df['Strategy_Returns'] = df['Signal'].shift(1) * df['Returns']

    # Calculate cumulative returns
    df['Cumulative_Market'] = (1 + df['Returns']).cumprod()
    df['Cumulative_Strategy'] = (1 + df['Strategy_Returns']).cumprod()

    # Portfolio value
    df['Portfolio_Value'] = initial_capital * df['Cumulative_Strategy']

    # Performance metrics
    total_return = (df['Cumulative_Strategy'].iloc[-1] - 1) * 100
    market_return = (df['Cumulative_Market'].iloc[-1] - 1) * 100

    # Calculate trade statistics
    buy_signals = df[df['Position'] == 2]
    sell_signals = df[df['Position'] == -2]
    num_trades = len(buy_signals)

    # Winning trades
    trades = []
    entry_price = None
    for idx, row in df.iterrows():
        if row['Position'] == 2:  # Buy signal
            entry_price = row['Close']
        elif row['Position'] == -2 and entry_price:  # Sell signal
            trades.append((row['Close'] - entry_price) / entry_price)
            entry_price = None

    if trades:
        winning_trades = sum(1 for t in trades if t > 0)
        win_rate = (winning_trades / len(trades)) * 100
    else:
        win_rate = 0

    # Sharpe ratio (annualized)
    strategy_std = df['Strategy_Returns'].std()
    if strategy_std > 0:
        sharpe = (df['Strategy_Returns'].mean() / strategy_std) * np.sqrt(252)
    else:
        sharpe = 0

    # Maximum drawdown
    cumulative = df['Cumulative_Strategy']
    running_max = cumulative.expanding().max()
    drawdown = (cumulative - running_max) / running_max
    max_drawdown = drawdown.min() * 100

    # Print results
    print("\n" + "=" * 50)
    print(f"SMMA {fast_period}/{slow_period} Crossover Strategy Backtest")
    print("=" * 50)
    print(f"Period: {df.index[0].date()} to {df.index[-1].date()}")
    print(f"Initial Capital: ${initial_capital:,.2f}")
    print(f"\nPerformance Metrics:")
    print(f"  Strategy Return: {total_return:.2f}%")
    print(f"  Buy & Hold Return: {market_return:.2f}%")
    print(f"  Final Portfolio Value: ${df['Portfolio_Value'].iloc[-1]:,.2f}")
    print(f"  Number of Trades: {num_trades}")
    print(f"  Win Rate: {win_rate:.2f}%")
    print(f"  Sharpe Ratio: {sharpe:.2f}")
    print(f"  Max Drawdown: {max_drawdown:.2f}%")
    print("=" * 50)

    # Plot results
    fig, (ax1, ax2, ax3) = plt.subplots(3, 1, figsize=(14, 10), sharex=True)

    # Price and SMMAs
    ax1.plot(df.index, df['Close'], label='Close Price', linewidth=1.5)
    ax1.plot(df.index, df['SMMA_fast'], label=f'SMMA {fast_period}', linewidth=1)
    ax1.plot(df.index, df['SMMA_slow'], label=f'SMMA {slow_period}', linewidth=1)
    ax1.scatter(buy_signals.index, df.loc[buy_signals.index, 'Close'],
                color='green', marker='^', s=100, label='Buy', zorder=5)
    ax1.scatter(sell_signals.index, df.loc[sell_signals.index, 'Close'],
                color='red', marker='v', s=100, label='Sell', zorder=5)
    ax1.set_ylabel('Price')
    ax1.set_title(f'SMMA {fast_period}/{slow_period} Crossover Strategy')
    ax1.legend()
    ax1.grid(alpha=0.3)

    # Cumulative returns
    ax2.plot(df.index, df['Cumulative_Strategy'], label='Strategy', linewidth=2)
    ax2.plot(df.index, df['Cumulative_Market'], label='Buy & Hold', linewidth=2, alpha=0.7)
    ax2.set_ylabel('Cumulative Returns')
    ax2.legend()
    ax2.grid(alpha=0.3)

    # Drawdown
    ax3.fill_between(df.index, drawdown * 100, 0, alpha=0.3, color='red')
    ax3.set_ylabel('Drawdown (%)')
    ax3.set_xlabel('Date')
    ax3.grid(alpha=0.3)

    plt.tight_layout()
    plt.show()

    return df


# Run the backtest
if __name__ == "__main__":
    # Option 1: Use sample data (no yfinance needed)
    # df_results = backtest_smma_cross(
    #     use_sample=True,
    #     fast_period=5,
    #     slow_period=13,
    #     initial_capital=10000
    # )

    # Option 2: Load from CSV (uncomment to use)
    # df_results = backtest_smma_cross(
    #     csv_path='your_data.csv',
    #     fast_period=5,
    #     slow_period=13,
    #     initial_capital=10000
    # )

    # Option 3: Pass your own DataFrame (uncomment to use)
    api = upstox_client.HistoryV3Api()
    response = api.get_historical_candle_data1(instrument_key='NSE_INDEX|Nifty 50', unit='minutes', interval=15,
                                               to_date='2025-12-09', from_date='2025-11-10')
    candles = getattr(getattr(response, 'data', None), 'candles', [])

    # Transform candles data into proper DataFrame format
    # Candles format: [timestamp, open, high, low, close, volume, oi]
    your_df = pd.DataFrame(candles, columns=['Date', 'Open', 'High', 'Low', 'Close', 'Volume', 'OI'])
    your_df['Date'] = pd.to_datetime(your_df['Date'])
    your_df = your_df.set_index('Date')
    your_df = your_df.drop('OI', axis=1)  # Drop OI column if not needed

    df_results = backtest_smma_cross(
        df=your_df,
        fast_period=5,
        slow_period=13,
        initial_capital=10000
    )