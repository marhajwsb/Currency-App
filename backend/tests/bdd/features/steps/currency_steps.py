from behave import given, when, then
from fastapi.testclient import TestClient
from app.main import app
from app.repositories.session import SessionLocal
from app.models.currency import CurrencyRate
from datetime import datetime

client = TestClient(app)

@given('the backend application is running')
def step_impl(context):
    context.client = client

@when('I send a POST request to "{url}"')
def step_impl(context, url):
    context.response = context.client.post(url)

@then('the response status code should be 200')
def step_impl(context):
    assert context.response.status_code == 200, f"Zły status: {context.response.status_code}. Detale: {context.response.text}"

@then('the database should contain rates for "{date_str}"')
def step_impl(context, date_str):
    target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    
    db = SessionLocal()
    try:
        exists = db.query(CurrencyRate).filter(CurrencyRate.date == target_date).first()
        assert exists is not None, f"Brak danych w bazie dla daty {date_str}"
    finally:
        db.close()