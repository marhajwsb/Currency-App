Feature: Currency management
  
  Scenario: Fetch and store rates from NBP
    Given the backend application is running
    When I send a POST request to "/currencies/fetch?target_date=2023-10-10"
    Then the response status code should be 200
    And the database should contain rates for "2023-10-10"