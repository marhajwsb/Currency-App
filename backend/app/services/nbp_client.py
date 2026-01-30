import httpx
from fastapi import HTTPException
from datetime import date
from typing import List, Dict, Any

class NBPClient:
    BASE_URL = "https://api.nbp.pl/api/exchangerates/tables/A"

    async def fetch_rates_range(
        self, 
        start_date: date, 
        end_date: date
    ) -> List[Dict[str, Any]]:
        """
        Pobiera listę tabel kursowych dla wybranego zakresu dat.
        
        Returns:
            Lista słowników, gdzie każdy słownik reprezentuje jeden dzień roboczy.
            Przykład: [
                {
                    'table': 'A',
                    'no': '001/A/NBP/2024',
                    'effectiveDate': '2024-01-02',
                    'rates': [
                        {'currency': 'dolar amerykański', 'code': 'USD', 'mid': 3.9535},
                        ...
                    ]
                },
                ...
            ]
        """
        url = f"{self.BASE_URL}/{start_date.isoformat()}/{end_date.isoformat()}/"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url, 
                    params={"format": "json"}, 
                    timeout=30.0,
                    follow_redirects=True
                )
                
                if response.status_code == 404:
                    return []
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"NBP API returned status {response.status_code}"
                    )
                
                data = response.json()
                
                if not isinstance(data, list):
                    raise HTTPException(
                        status_code=502,
                        detail="Unexpected response format from NBP API"
                    )
                
                return data
                
            except httpx.TimeoutException:
                raise HTTPException(
                    status_code=504,
                    detail="NBP API request timeout"
                )
            except httpx.HTTPError as e:
                raise HTTPException(
                    status_code=502,
                    detail=f"NBP API connection error: {str(e)}"
                )
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Unexpected error: {str(e)}"
                )

    async def fetch_rates_for_date(self, target_date: date) -> List[Dict[str, Any]]:
        """
        Pobiera kursy walut dla konkretnej daty.
        Zachowane dla kompatybilności wstecznej.
        
        Returns:
            Lista słowników z kursami walut dla danego dnia.
        """
        url = f"{self.BASE_URL}/{target_date.isoformat()}/"
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url, 
                    params={"format": "json"},
                    timeout=30.0
                )
                
                if response.status_code == 404:
                    return []
                
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"NBP API returned status {response.status_code}"
                    )
                
                data = response.json()
                
                if isinstance(data, list) and len(data) > 0:
                    return data[0].get('rates', [])
                
                return []
                
            except httpx.TimeoutException:
                raise HTTPException(
                    status_code=504,
                    detail="NBP API request timeout"
                )
            except httpx.HTTPError as e:
                raise HTTPException(
                    status_code=502,
                    detail=f"NBP API error: {str(e)}"
                )