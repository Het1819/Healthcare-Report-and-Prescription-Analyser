
# Project AI Agent

**Overview:**
- **Project name:** Project_AI_Agent
- **Purpose:** A multi-modal medical assistant combining document and image analysis with conversational agents. The backend provides REST endpoints for report analysis, prescription/image analysis, and symptom checking; the frontend is a React + Vite single-page application that consumes those services.

**Architecture:**
- **Backend:** Python Flask API located in `Backend/` that initializes multiple agent modules (`multimodel_medical_agent`, `patient_advisor`, `prescription_reader`, `doctor_agent`) and exposes routes:
	- `POST /analyze_reports` — upload medical reports (PDF/DOCX/etc.) and receive structured analysis, Markdown and HTML summaries, and JSON output.
	- `POST /analyze_prescription` — upload prescription images for OCR/extraction and analysis.
	- `POST /doctor_assistant` — text-based symptom analysis (JSON input/output).
- **Frontend:** React + Vite app in `Frontend/` (uses React 19, Vite, Tailwind-related deps). The UI will call backend endpoints and present results to users.

**Who should use this project:**
- Developers building medical assistant prototypes, researchers integrating multimodal document/image analysis with LLM-based agents, clinicians for internal prototyping (not a replacement for professional diagnosis), and educators demonstrating AI-assisted clinical workflows.

**Languages & Frameworks:**
- Backend: Python 3.11+ (recommended), Flask 3.x, Flask-CORS, python-dotenv
- Frontend: React (v19) with Vite, Tailwind-related packages (see `Frontend/package.json`)

**Key Files & Directories:**
- `Backend/app.py` — Flask application and HTTP routes (entrypoint for backend server).
- `Backend/requirements.txt` — Python dependencies for backend.
- `Backend/*.py` — Agent modules and helpers (`doctor_agent.py`, `multimodel_medical_agent.py`, `patient_advisor.py`, `prescription_reader.py`, `document_loader.py`).
- `Frontend/` — React application created with Vite. Main source in `Frontend/src/`.
- `Frontend/package.json` — frontend dependencies and scripts.

**Environment / Secrets:**
- The backend uses environment variables (via `python-dotenv`). Create a `.env` file in `Backend/` with at least the following keys (example names shown):

```
# Backend .env example (Backend/.env)
GOOGLE_API_KEY=your-google-api-key
FLASK_SECRET_KEY=a_secure_secret
# Any other keys required by your agent implementations
```

- `GOOGLE_API_KEY` is checked in `app.py` and some agents may require other API keys (e.g., cloud vision, GenAI keys). Keep secrets out of source control and add `.env` to `.gitignore`.

**Installation & Setup (Windows PowerShell)**

1. Backend (Python)

```powershell
# From repository root
cd Backend
# Create virtual environment (use Python 3.11+)
python -m venv .venv
# Activate
.\\.venv\\Scripts\\Activate.ps1
# Upgrade pip
python -m pip install --upgrade pip
# Install dependencies
pip install -r requirements.txt
```

2. Frontend (Node + npm)

```powershell
cd ..\\Frontend
# Install packages (node + npm must be installed)
npm install
```

**Run Locally (development)**

1. Start Backend (PowerShell, in `Backend/` with `.venv` active):

```powershell
# ensure .env present in Backend/
python app.py
# By default app.py runs Flask with debug=True on port 5001
```

2. Start Frontend (PowerShell, in `Frontend/`):

```powershell
npm run dev
# Vite will start a dev server (commonly at http://localhost:5173)
```

3. Using the app
- Point the frontend to the backend server (update any API base URL or proxy configuration if necessary). Submit files or text from the UI to the endpoints listed above.

**Important Implementation Notes**
- `Backend/app.py` expects agent classes to be importable and to implement specific methods such as `analyze_file`, `generate_consultation`, `analyze_prescription_image`, and `analyze` depending on the agent. If an agent fails to initialize, the server logs an initialization error and routes will return a 500 system error.
- Temporary uploaded files are saved to the filesystem using `tempfile.NamedTemporaryFile` and are removed after processing. Ensure the runtime has permission to write temporary files.
- The backend validates and attempts to parse JSON outputs from agents. If an agent returns invalid JSON, the server returns an error with helpful messages for debugging.
- The project currently includes calls to `GOOGLE_API_KEY` and uses packages such as `google-genai` and `google-auth`. Make sure API keys and credentials are set up and have required permissions.

**Versions**
- Backend packages: see `Backend/requirements.txt` (Flask 3.1.2, python-dotenv, google-genai, pydantic 2.x, Pillow, pypdf, python-docx, etc.).
- Frontend packages: see `Frontend/package.json` (React 19+, Vite 7+, Tailwind helper packages).

**How It Works (high level)**
- Upload flow (`/analyze_reports`): file uploaded -> extractor agent parses document into structured JSON -> consultant agent generates Markdown and structured JSON consultation -> server returns both human-readable and machine-readable outputs.
- Prescription flow: prescription image uploaded -> prescription reader agent performs OCR and analysis -> server returns extracted fields and interpreted analysis.
- Symptom flow: text input -> doctor assistant agent analyzes symptoms and returns structured JSON and a formatted Markdown summary.

**Troubleshooting & Tips**
- If imports fail on server start, confirm current working directory and PYTHONPATH allow importing modules from `Backend/` (run from `Backend/` directory or install package with `pip install -e .` if packaging).
- Watch for missing API keys — `app.py` will print a warning if `GOOGLE_API_KEY` is not set.
- If running into model/agent-specific errors, enable debug logging and inspect agent modules directly to test their helper functions.

**Security & Legal**
- This project is a prototype/demo. It is not medical advice and should not be used as a diagnostic tool in production. Display appropriate disclaimers to users and follow privacy rules for any patient data — ensure secure transport (HTTPS), secure storage, and proper access control.

**Contributing**
- Add issues and PRs describing changes. For backend changes, include unit tests where possible and keep dependency updates minimal and documented.

**Next Steps / Suggestions**
- Add a small `README_BACKEND.md` and `README_FRONTEND.md` inside respective folders with more detailed agent configuration and environment variables. Consider adding a Dockerfile for reproducible local setup.

---

If you'd like, I can also:
- Add a `Backend/README.md` with agent-specific config examples.
- Create a simple `.env.example` in `Backend/` and a `docker-compose.yml` to run frontend + backend together.

Let me know which of these you'd like next.
