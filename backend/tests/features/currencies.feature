Feature: Currency API

  Scenario: Fetch currencies from NBP API
    Given the backend is running
    When I call the /currencies/fetch endpoint
    Then the response status should be 200
    And the response should contain a saved_records count greater than 0

  Scenario: Get currencies by date
    Given currencies have been fetched for today
    When I call /currencies/{date} with today's date
    Then the response status should be 200
    And the response should include at least one currency
