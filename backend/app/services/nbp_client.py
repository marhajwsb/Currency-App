import requests
from datetime import date, timedelta

NBP_API_URL = "https://api.nbp.pl/api/exchangerates/tables/A"

def fetch_rates_for_date(fetch_date: date):
    headers = {"Accept": "application/json"}

    for _ in range(7):  # cofamy się max 7 dni
        url = f"{NBP_API_URL}/{fetch_date.isoformat()}/"
        response = requests.get(url, headers=headers)

        if response.status_code == 200:
            data = response.json()
            return data[0]["rates"]

        if response.status_code == 404:
            fetch_date -= timedelta(days=1)
            continue

        raise Exception(f"NBP API error: {response.status_code}")

    raise Exception("No NBP data found in last 7 days")
