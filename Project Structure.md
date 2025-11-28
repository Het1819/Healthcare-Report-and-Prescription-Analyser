# Medical AI Agent API

## Overview
A Flask-based Medical AI Agent API that uses Google's Gemini AI for medical analysis. The system now includes database-backed session management and long-term memory storage, inspired by Google's Agent Development Kit (ADK) patterns.

## Features
- **Report Analysis**: Analyze medical reports (PDFs, images, DOCX) and generate patient-friendly summaries
- **Prescription Reading**: Extract medicine information from prescription images and explain drug purposes
- **Symptom Analysis**: Analyze symptoms and provide preliminary health guidance
- **Session Management**: Database-backed session persistence for conversation history
- **Memory Service**: Long-term knowledge storage across multiple conversations

## Project Structure
```
Project_AI_Agent/Project_AI_Agent/
├── Backend/
│   ├── app.py                    # Main Flask application with API routes
│   ├── database.py               # SQLAlchemy database models (Session, Event, Memory)
│   ├── session_service.py        # Session management service
│   ├── memory_service.py         # Long-term memory service
│   ├── doctor_agent.py           # Symptom analysis agent
│   ├── multimodel_medical_agent.py  # Medical report extraction agent
│   ├── patient_advisor.py        # Consultation summary generator
│   ├── prescription_reader.py    # Prescription image analyzer
│   └── document_loader.py        # File loader utility
└── Frontend/
    └── ... (React/Vite frontend)
```

## API Endpoints

### Session Management
- `POST /sessions` - Create a new session
- `GET /sessions/<user_id>` - List all sessions for a user
- `GET /sessions/<user_id>/<session_id>` - Get a specific session
- `DELETE /sessions/<user_id>/<session_id>` - Delete a session
- `POST /sessions/<user_id>/<session_id>/events` - Add an event to a session
- `GET /sessions/<user_id>/<session_id>/events` - Get all events in a session
- `GET /sessions/<user_id>/<session_id>/history` - Get conversation history

### Memory Management
- `POST /memory/<user_id>` - Add a memory
- `POST /memory/<user_id>/from_session/<session_id>` - Convert session to memory
- `GET /memory/<user_id>/search?q=<query>` - Search memories
- `GET /memory/<user_id>` - Get all memories
- `DELETE /memory/<user_id>/<memory_id>` - Delete a memory

### Agent Endpoints
- `POST /analyze_reports` - Analyze medical reports
- `POST /analyze_prescription` - Analyze prescription images
- `POST /doctor_assistant` - Analyze symptoms

## Database
SQLite database (`agent_data.db`) with three tables:
- **sessions**: Stores session metadata and state
- **events**: Stores conversation events (user messages, agent responses)
- **memories**: Stores long-term knowledge for retrieval across sessions

## Environment Variables
- `GOOGLE_API_KEY` or `GEMINI_API_KEY`: Required for Gemini AI access
- `FLASK_SECRET_KEY`: Flask session secret

## Running the Application
The backend runs on port 5000 via the workflow:
```bash
cd Project_AI_Agent/Project_AI_Agent/Backend && python app.py
```

## Recent Changes
- Added database-backed session management with SQLAlchemy
- Added memory service for long-term knowledge storage
- Integrated session tracking into all agent endpoints
- Added memory context retrieval for personalized responses
- Updated API with comprehensive endpoint documentation

## Architecture
Based on Google's Agent Development Kit (ADK) patterns:
- **Sessions**: Short-term memory for single conversations
- **Memory**: Long-term knowledge persisted across conversations
- **Events**: Building blocks of conversations (user input, agent responses)
