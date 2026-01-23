import requests
from datetime import date

NBP_API_URL = "https://api.nbp.pl/api/exchangerates/tables/A"

def fetch_rates_for_date(fetch_date: date):
    url = f"{NBP_API_URL}/{fetch_date}"
    headers = {"Accept": "application/json"}

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        raise Exception("NBP API error")

    data = response.json()
    return data[0]["rates"]
