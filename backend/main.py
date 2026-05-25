from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# Import our custom database files
import models
from database import engine, get_db
from ai_service import generate_test_cases

# Create the database tables automatically when the server runs
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI QA Agent API with Database History")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RequirementRequest(BaseModel):
    text: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI QA Agent Backend with History support!"}

@app.post("/generate-tests")
def handle_generate_tests(request: RequirementRequest, db: Session = Depends(get_db)):
    """
    Receives requirements, gets AI analysis, saves it to SQLite, and returns it.
    """
    if not request.text.strip():
        raise HTTPException(status_code=400, detail="Requirement text cannot be empty")
    
    # 1. Call Gemini AI function
    ai_result = generate_test_cases(request.text)
    
    # 2. Save the entry to the SQLite Database
    new_record = models.TestSuite(
        requirements=request.text,
        generated_test_cases=ai_result
    )
    db.add(new_record)
    db.commit() # Save changes permanent
    db.refresh(new_record)
    
    return {"status": "success", "data": ai_result}

@app.get("/history")
def get_history(db: Session = Depends(get_db)):
    """
    New API Endpoint: Fetches all past generated test records so the UI can display them.
    """
    records = db.query(models.TestSuite).order_by(models.TestSuite.id.desc()).all()
    return {"status": "success", "history": records}