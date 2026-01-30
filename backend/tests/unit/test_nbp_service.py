import pytest
import httpx
import respx
from datetime import date
from app.services.nbp_client import NBPClient

@pytest.mark.asyncio
@respx.mock
async def test_fetch_rates_range_success(respx_mock):
    mock_data = [
        {
            "effectiveDate": "2024-01-02",
            "rates": [{"code": "USD", "mid": 3.99}]
        },
        {
            "effectiveDate": "2024-01-03",
            "rates": [{"code": "USD", "mid": 4.01}]
        }
    ]
    
    url = "https://api.nbp.pl/api/exchangerates/tables/A/2024-01-02/2024-01-03/"
    respx_mock.get(url).return_value = httpx.Response(200, json=mock_data)

    client = NBPClient()
    data = await client.fetch_rates_range(date(2024, 1, 2), date(2024, 1, 3))
    
    assert len(data) == 2
    assert data[0]['effectiveDate'] == "2024-01-02"
    assert data[1]['rates'][0]['code'] == "USD"

@pytest.mark.asyncio
@respx.mock
async def test_fetch_rates_range_404_returns_empty(respx_mock):
    url = "https://api.nbp.pl/api/exchangerates/tables/A/2024-01-06/2024-01-07/"
    respx_mock.get(url).return_value = httpx.Response(404)

    client = NBPClient()
    data = await client.fetch_rates_range(date(2024, 1, 6), date(2024, 1, 7))
    
    assert data == []

@pytest.mark.asyncio
@respx.mock
async def test_fetch_rates_range_timeout(respx_mock):
    url = "https://api.nbp.pl/api/exchangerates/tables/A/2024-01-02/2024-01-03/"
    respx_mock.get(url).side_effect = httpx.TimeoutException("Timeout")

    client = NBPClient()
    with pytest.raises(Exception) as excinfo:
        await client.fetch_rates_range(date(2024, 1, 2), date(2024, 1, 3))
    
    assert "timeout" in str(excinfo.value.detail).lower()