import pytest
import requests
from pytest_bdd import scenarios, given, when, then
from datetime import date

BASE_URL = "http://localhost:8000"

scenarios('./features/currencies.feature')


# GIVEN
@given("the backend is running")
def backend_running():
    response = requests.get(f"{BASE_URL}/docs")
    assert response.status_code == 200


@given("currencies have been fetched for today")
def fetch_currencies():
    response = requests.post(f"{BASE_URL}/currencies/fetch")
    assert response.status_code == 200


# WHEN
@pytest.fixture
def response_fetch():
    return requests.post(f"{BASE_URL}/currencies/fetch")


@pytest.fixture
def response_by_date():
    today_str = date.today().isoformat()
    return requests.get(f"{BASE_URL}/currencies/{today_str}")


@when("I call the /currencies/fetch endpoint")
def call_fetch(response_fetch):
    return response_fetch


@when("I call /currencies/{date} with today's date")
def call_by_date(response_by_date):
    return response_by_date


# THEN
@then("the response status should be 200")
def check_status(response_fetch, response_by_date, request):
    if request.node.name.startswith("test_fetch_currencies"):
        assert response_fetch.status_code == 200
    else:
        assert response_by_date.status_code == 200


@then("the response should contain a saved_records count greater than 0")
def check_saved_records(response_fetch):
    data = response_fetch.json()
    assert data["saved_records"] > 0


@then("the response should include at least one currency")
def check_currency_list(response_by_date):
    data = response_by_date.json()
    assert len(data) > 0
