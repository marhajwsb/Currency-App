import os
import time
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Pobranie DATABASE_URL z Docker Compose
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://admin:admin@db:5432/currencies")

# Retry loop dla połączenia z bazą
for i in range(10):
    try:
        engine = create_engine(DATABASE_URL)
        conn = engine.connect()
        conn.close()
        print("Połączono z bazą danych ✅")
        break
    except Exception as e:
        print(f"Nie udało się połączyć z bazą, próbuję ponownie ({i+1}/10)...")
        time.sleep(3)
else:
    raise Exception("Nie udało się połączyć z bazą danych po wielu próbach")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
