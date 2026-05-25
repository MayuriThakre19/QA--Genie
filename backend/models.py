from sqlalchemy import Column, Integer, Text
from database import Base

class TestSuite(Base):
    """
    This defines our 'test_suites' table inside the SQLite database file.
    """
    __tablename__ = "test_suites"

    # Columns
    id = Column(Integer, primary_key=True, index=True)
    requirements = Column(Text, nullable=False) # Stores what the user typed
    generated_test_cases = Column(Text, nullable=False) # Stores what Gemini generated