import pytest
import httpx
import respx
from app.services.nbp_client import NBPClient


@pytest.mark.asyncio
@respx.mock
async def test_fetch_rates_success(respx_mock):
    mock_data = [{"rates": [{"code": "USD", "mid": 4.0}]}]
    respx_mock.get("https://api.nbp.pl/api/exchangerates/tables/A/2023-10-10/").return_value = httpx.Response(200, json=mock_data)

    client = NBPClient()
    rates = await client.fetch_rates_for_date("2023-10-10")
    
    assert len(rates) == 1
    assert rates[0]['code'] == "USD"

@pytest.mark.asyncio
async def test_fetch_rates_404_returns_empty(respx_mock):
    respx_mock.get("https://api.nbp.pl/api/exchangerates/tables/A/2023-10-12/").return_value = httpx.Response(404)

    client = NBPClient()
    rates = await client.fetch_rates_for_date("2023-10-12")
    
    assert rates == []