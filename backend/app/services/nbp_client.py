import httpx
from fastapi import HTTPException
from datetime import date

class NBPClient:
    BASE_URL = "https://api.nbp.pl/api/exchangerates/tables/A/"

    async def fetch_rates_for_date(self, target_date: date):
        url = f"{self.BASE_URL}{target_date.isoformat()}/"
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params={"format": "json"})
                if response.status_code == 404:
                    return []
                response.raise_for_status()
                data = response.json()
                return data[0]['rates']
            except httpx.HTTPError as e:
                raise HTTPException(status_code=502, detail=f"NBP API Error: {str(e)}")