from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Define where the database file will be created locally
SQLALCHEMY_DATABASE_URL = "sqlite:///./qa_agent.db"

# 2. Create the database engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False} # Needed only for SQLite
)

# 3. Create a Session factory to handle reading/writing data
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Create a Base class that our models will inherit from
Base = declarative_base()

def get_db():
    """
    Helper function (dependency) to open a database connection 
    when an API gets hit, and close it when done.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()