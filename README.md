Opis funkcjonalości:
1. Opis funkcjonalności aplikacji
Aplikacja służy do archiwizacji i analizy kursów walut pobieranych z Narodowego Banku Polskiego.
  Pobieranie danych: Integracja z API NBP (Tabela A) pozwalająca na pobieranie danych w zakresach do 93 dni.
  Przechowywanie: Zastosowanie bazy danych SQLite do trwałego zapisu pobranych kursów, co eliminuje konieczność wielokrotnego odpytywania serwerów zewnętrznych.
  Zaawansowane filtrowanie: Interfejs pozwala na dynamiczne przeglądanie danych z podziałem na:
    Lata (wykrywane automatycznie z bazy).
    Kwartały (wyliczane matematycznie Q1-Q4).
    Miesiące (z polskimi nazwami).
    Dni robocze (zgodnie z publikacjami NBP)
  Walidacja: System blokuje możliwość wybrania dat przyszłych oraz zakresów przekraczających limity API NBP.

3. Instrukcja uruchomienia (Docker)
Aplikacja została w pełni skonteneryzowana, co zapewnia powtarzalność środowiska.
  Wymagania: Zainstalowany Docker oraz Docker Compose.
  Kroki:
    Pobierz repozytorium na dysk lokalny.
    Otwórz terminal w folderze głównym projektu (currency-app).
    Uruchom proces budowania i startu kontenerów:
      docker-compose up --build
   
  Po zakończeniu procesu aplikacja będzie dostępna pod adresami:
    Frontend: http://localhost:4200
    Backend (API): http://localhost:8000
    Dokumentacja API (Swagger): http://localhost:8000/docs
    
4. Raport z testów (Stan na 30.01.2026)
  W projekcie zastosowano piramidę testów, łącząc testy jednostkowe z testami behawioralnymi (BDD).
    Backend (FastAPI)
      Pytest: Przetestowano NBPClient pod kątem obsługi błędów sieciowych (404, Timeout). Wynik: PASS.
      Behave (BDD): Zweryfikowano scenariusz "Pobierz i zapisz".
        Wynik: 1 scenario passed, 4 steps passed.
    Kluczowe spostrzeżenie: Testy BDD ujawniły błąd niezgodności typów SQLite (String vs Date), który został naprawiony przed oddaniem projektu.

   Frontend (Angular)
     Vitest: Przetestowano logikę filtrowania oraz usługi HTTP.
      Wynik: 9 tests passed.

Analiza błędów: 
W trakcie testów manualnych zidentyfikowano błąd w logice mapowania dat w komponentach filtrów.
W określonych przypadkach filtry nie wyświetlają wszystkich dostępnych miesięcy/dni mimo obecności danych w bazie.
Problem został udokumentowany i zakwalifikowany do poprawy w kolejnej wersji systemu (wymagana refaktoryzacja).
