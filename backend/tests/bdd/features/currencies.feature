Feature: Currency management
  
  Scenario: Fetch and store rates from NBP for a specific range
    Given the backend application is running
    When I send a POST request to "/currencies/fetch?start_date=2024-01-02&end_date=2024-01-02"
    Then the response status code should be 200
    And the database should contain rates for "2024-01-02"