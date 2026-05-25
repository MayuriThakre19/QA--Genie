# 🧞‍♂️ QA-Genie: Persistent AI Test Automation Agent

QA-Genie is a high-performance, single-page web application designed to automatically transform raw business requirements into robust, comprehensive QA test matrices. Built with a decoupled architecture, it eliminates heavy frontend framework overhead while ensuring full data persistence via a structured SQL ledger.

## 🚀 Key Features
- **Dynamic Single-Page Application (SPA):** Tab-swapping sidebar navigation managing Overview Telemetry, Generator Workspaces, and Engine Settings seamlessly without page reloads.
- **Automated Test Generation:** Generates structured Unit Tests, Integration flows, and critical logical boundary Edge Cases in under 3 seconds using Google Gemini 2.5 Flash.
- **Persistent Transaction Ledger:** Every session is tracked and automatically written to a local SQLite database, allowing users to reload historical test scripts instantly with a single click.
- **Hot-Swappable Configurations:** Interactive Engine Settings to adjust inference models and temperature parameters on the fly.

## 🛠️ Technical Tech Stack
- **Frontend Core:** Native HTML5, CSS3 Variables, Vanilla Asynchronous JavaScript (Fetch API / DOM Manipulation)
- **Backend Routing:** Python, FastAPI, Uvicorn
- **Object-Relational Mapping (ORM):** SQLAlchemy Engine
- **Database Layer:** SQLite (`qa_agent.db`)
- **AI Core Intelligence:** Google GenAI SDK (`gemini-2.5-flash`)

## 👥 Team Members
- 1. Mayuri Thakre
- 2. Abijith UK

## 📁 Project Architecture Directory
```text
ai-qa-agent/
│
├── backend/
│   ├── main.py          # FastAPI application server & endpoints
│   ├── database.py      # SQLAlchemy connection setup & session factories
│   ├── models.py        # SQLite relational database schemas
│   ├── ai_service.py    # Google GenAI SDK connector logic
│   └── requirements.txt # Python dependency tracking manifest
│
├── frontend/
│   ├── index.html       # Single-page semantic dashboard structure
│   ├── style.css        # Dashboard interface design & grid layouts
│   └── app.js           # SPA routing, state management & API fetch handlers
│
└── README.md            # Comprehensive production documentation

🛠️ Deployment & Local Installation Guide
Follow these standardized steps to provision the local environment and execute the QA-Genie automation engine stack.

Prerequisites
Ensure your local development environment has Python 3.10+ installed.

1. Dependency Provisioning
Navigate to the backend microservice directory and install the required structural package manifests:

Bash
cd backend
pip install -r requirements.txt
2. Secure Environment Configuration
QA-Genie strictly enforces decoupled runtime credentials. Export your Google Gemini API token to your system environment variables.

On Windows (Command Prompt):

DOS
set GEMINI_API_KEY="your_private_api_key_here"
On Windows (PowerShell):

PowerShell
$env:GEMINI_API_KEY="your_private_api_key_here"
On macOS / Linux:

Bash
export GEMINI_API_KEY="your_private_api_key_here"
3. Server Initialization
Execute the high-performance ASGI server using Uvicorn to boot the FastAPI application routing core. The database schema engines will automatically compile a fresh local SQLite instance (qa_agent.db) upon startup:

Bash
uvicorn main:app --reload
The service layer will initialize and run locally on http://127.0.0.1:8000.

4. Client Access
Because this architecture features a lightweight, zero-overhead client layer, no complex frontend package compilation is required. Simply launch the user interface directly by opening frontend/index.html in any modern web browser instance.
