Feature: Fetch currencies

  Scenario: Fetch currency rates for a date
    Given NBP API is available
    When I fetch currencies for date "2024-01-15"
    Then response status should be 200
