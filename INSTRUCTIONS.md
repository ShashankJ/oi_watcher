# Instructions for Enabling Live Data

This application is currently configured to use static and dummy data because a Upstox access token was not available. To enable live data fetching, you will need to make the following changes:

## 1. Get a Upstox Access Token

- Go to the [Upstox Developer Console](https://upstox.com/developer/apps) and create an app to get your API key and secret.
- Use the API key and secret to generate an access token. You can follow the instructions in the [Upstox API documentation](https://upstox.com/developer/api-documentation/authentication) for this.

## 2. Configure the Backend

1.  **Create a `.env` file:** In the root directory of the project, create a file named `.env`.
2.  **Add your access token:** In the `.env` file, add the following line, replacing `<your_access_token>` with the access token you generated:
    ```
    ACCESS_TOKEN=<your_access_token>
    ```
3.  **Set the expiry date:** You can also set the `EXPIRY_DATE` in the `.env` file to the desired expiry date for the options you want to track (e.g., `EXPIRY_DATE=2025-10-28`).

## 3. Modify the Backend Code

1.  **Update `backend/upstox_api.py`:**
    -   You will need to add a function to `backend/upstox_api.py` to fetch the data from the "Intraday Candle Data V3" API. This function should take the `instrument_key` and `access_token` as input.
    -   You will also need a function to get the live Nifty 50 spot price. You can use the same candle API for the Nifty 50 index instrument (`NSE_INDEX|Nifty 50`).

2.  **Update `backend/main.py`:**
    -   In the `poll_data` function, you will need to:
        -   Remove the hardcoded `spot_price` and call the new function to get the live spot price.
        -   Remove the random data generation and instead call the new `get_instrument_data` function for each option to get the live LTP and OI.
        -   The `change_in_oi` should be calculated by comparing the current OI with the OI from the previous poll, which you can get from the database.

By following these steps, you can switch from using static data to live data from the Upstox API.