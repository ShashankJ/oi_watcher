# OI Watcher

This is a web application to poll options data from the Upstox API, analyze Open Interest (OI), change in OI, and Put-Call Ratio (PCR), and display it in a user-friendly interface.

## Features

- **Backend**: A FastAPI application that polls data from the Upstox API.
- **Frontend**: A React application that displays the data in a table and a chart.
- **Database**: PostgreSQL for storing the polled option data.
- **Containerized**: The entire application can be run using Docker Compose.

## Architecture

The application consists of three main services:

1.  **`backend`**: A Python service using FastAPI that:
    - Periodically polls the Upstox API for Nifty 50 option chain data.
    - Selects 5 call/put contracts above and 5 below the current price.
    - Stores the relevant data (LTP, OI, Change in OI) in the PostgreSQL database.
    - Exposes an API endpoint for the frontend to retrieve the latest data.

2.  **`frontend`**: A React service that:
    - Provides a UI to visualize the options data.
    - Displays the current price of all selected contracts in a table.
    - Shows a bar chart comparing Put and Call OI for the selected contracts.
    - Displays the calculated PCR value.

3.  **`db`**: A PostgreSQL database service to persist the option data.

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your machine.
- An Upstox developer account and an API access token.

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd oi_watcher
    ```

2.  **Create a `.env` file:**
    Create a file named `.env` in the root of the project. You can copy the `.env.example` if one is provided, or create it from scratch.

3.  **Configure your environment:**
    Open the `.env` file and set the following variables:

    - `UPSTOX_ACCESS_TOKEN`: Your Upstox API access token.
    - `EXPIRY_DATE`: The expiry date for the Nifty 50 options you want to track, in `YYYY-MM-DD` format.
    - `DATABASE_URL`: The connection string for the PostgreSQL database. The value should be `postgresql://user:password@db:5432/oi_watcher` to connect to the database service in Docker.
    - `POLLING_INTERVAL`: The interval in seconds at which the application polls the Upstox API. Defaults to 300 (5 minutes).

    **Example `.env` file:**
    ```
    UPSTOX_ACCESS_TOKEN=your_secret_access_token
    EXPIRY_DATE=2024-12-26
    DATABASE_URL="postgresql://user:password@db:5432/oi_watcher"
    POLLING_INTERVAL=300
    ```

### Running the Application

1.  **Build and run the application using Docker Compose:**
    ```bash
    docker-compose up --build
    ```
    This command will build the Docker images for the backend and frontend services and start all the containers.

2.  **Access the application:**
    - The **frontend** will be available at [http://localhost:3000](http://localhost:3000).
    - The **backend** API will be available at [http://localhost:8000](http://localhost:8000).

## Development

If you want to run the services without Docker, you can follow these steps:

### Backend

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Create a virtual environment and activate it.
3.  Install the dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the FastAPI server:
    ```bash
    uvicorn main:app --reload
    ```

### Frontend

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```
3.  Run the React development server:
    ```bash
    npm start
    ```
    The application will be available at [http://localhost:3000](http://localhost:3000). Remember to have the backend running as well.