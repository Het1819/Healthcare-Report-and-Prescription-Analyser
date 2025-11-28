import os
import json
import tempfile
import markdown
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()

from database import db, init_db
from session_service import DatabaseSessionService
from memory_service import DatabaseMemoryService

try:
    from multimodel_medical_agent import MultimodalMedicalAgent
    from patient_advisor import PatientConsultantAgent
    from patient_advisor import ConsultationSummaryJSON 
    from prescription_reader import PrescriptionReaderAgent
    from doctor_agent import DoctorAssistant
    
except ImportError as e:
    print(f"Error importing agents: {e}")
    print("Please make sure all necessary files are in the current directory.")
    exit(1)

app = Flask(__name__)
CORS(app)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "A_SECURE_FALLBACK_KEY_")

init_db(app)

session_service = DatabaseSessionService(app_name="medical_agent")
memory_service = DatabaseMemoryService(app_name="medical_agent")

if not os.getenv("GOOGLE_API_KEY") and not os.getenv("GEMINI_API_KEY"):
    print("Warning: GOOGLE_API_KEY or GEMINI_API_KEY not found in environment variables.")

try:
    extractor_agent = MultimodalMedicalAgent()
    consultant_agent = PatientConsultantAgent()
    prescription_agent = PrescriptionReaderAgent()
    symptom_agent = DoctorAssistant()

except Exception as e:
    print(f"Failed to initialize agents: {e}")

def generate_error_response(message, status_code=400):
    return jsonify({
        "status": "error",
        "message": message
    }), status_code

def format_symptom_analysis_to_markdown(data):
    md = f"**{data.get('disclaimer_and_urgency', 'Disclaimer: No professional medical advice provided.')}**\n\n"
    md += "## 1. What You Might Be Experiencing\n"
    md += f"{data.get('current_condition_analysis', 'N/A')}\n\n"
    
    md += "## 2. Possible Medical Problems\n"
    problems = data.get('possible_medical_problems', [])
    md += "\n".join([f"- {p}" for p in problems]) if problems else "- N/A\n"
    md += "\n\n"
    
    md += "## 3. Immediate Actions to Take\n"
    actions = data.get('immediate_actions', [])
    md += "\n".join([f"- {a}" for a in actions]) if actions else "- N/A\n"
    md += "\n\n"
    
    md += "## 4. Recommended Specialist\n"
    md += f"**Specialist:** {data.get('recommended_specialist', 'General Practitioner (GP)')}\n\n"
    
    md += f"***\n{data.get('final_statement', 'N/A')}"
    return md


@app.route('/sessions', methods=['POST'])
def create_session():
    data = request.get_json(silent=True) or {}
    user_id = data.get('user_id', 'default_user')
    session_id = data.get('session_id')
    initial_state = data.get('initial_state', {})
    
    session = session_service.create_session(user_id, session_id, initial_state)
    return jsonify({
        "status": "success",
        "session": session.to_dict()
    }), 201

@app.route('/sessions/<user_id>', methods=['GET'])
def list_sessions(user_id):
    sessions = session_service.list_sessions(user_id)
    return jsonify({
        "status": "success",
        "sessions": [s.to_dict() for s in sessions]
    }), 200

@app.route('/sessions/<user_id>/<session_id>', methods=['GET'])
def get_session(user_id, session_id):
    session = session_service.get_session(user_id, session_id)
    if not session:
        return generate_error_response("Session not found", 404)
    return jsonify({
        "status": "success",
        "session": session.to_dict()
    }), 200

@app.route('/sessions/<user_id>/<session_id>', methods=['DELETE'])
def delete_session(user_id, session_id):
    success = session_service.delete_session(user_id, session_id)
    if not success:
        return generate_error_response("Session not found", 404)
    return jsonify({
        "status": "success",
        "message": "Session deleted"
    }), 200

@app.route('/sessions/<user_id>/<session_id>/events', methods=['POST'])
def add_event(user_id, session_id):
    data = request.get_json(silent=True)
    if not data or 'role' not in data or 'content' not in data:
        return generate_error_response("Missing 'role' or 'content' in request")
    
    event = session_service.add_event(
        user_id, session_id,
        role=data['role'],
        content=data['content'],
        metadata=data.get('metadata')
    )
    return jsonify({
        "status": "success",
        "event": event.to_dict()
    }), 201

@app.route('/sessions/<user_id>/<session_id>/events', methods=['GET'])
def get_events(user_id, session_id):
    limit = request.args.get('limit', type=int)
    events = session_service.get_events(user_id, session_id, limit)
    return jsonify({
        "status": "success",
        "events": [e.to_dict() for e in events]
    }), 200

@app.route('/sessions/<user_id>/<session_id>/history', methods=['GET'])
def get_history(user_id, session_id):
    limit = request.args.get('limit', 10, type=int)
    history = session_service.get_conversation_history(user_id, session_id, limit)
    return jsonify({
        "status": "success",
        "history": history
    }), 200


@app.route('/memory/<user_id>', methods=['POST'])
def add_memory(user_id):
    data = request.get_json(silent=True)
    if not data or 'content' not in data:
        return generate_error_response("Missing 'content' in request")
    
    memory = memory_service.add_memory(
        user_id,
        content=data['content'],
        memory_type=data.get('memory_type', 'general'),
        source_session_id=data.get('source_session_id')
    )
    return jsonify({
        "status": "success",
        "memory": memory.to_dict()
    }), 201

@app.route('/memory/<user_id>/from_session/<session_id>', methods=['POST'])
def add_session_to_memory(user_id, session_id):
    data = request.get_json(silent=True) or {}
    summary = data.get('summary')
    
    memory = memory_service.add_session_to_memory(user_id, session_id, summary)
    if not memory:
        return generate_error_response("Session not found or has no events", 404)
    
    return jsonify({
        "status": "success",
        "memory": memory.to_dict()
    }), 201

@app.route('/memory/<user_id>/search', methods=['GET'])
def search_memories(user_id):
    query = request.args.get('q', '')
    limit = request.args.get('limit', 5, type=int)
    
    if not query:
        return generate_error_response("Missing 'q' query parameter")
    
    memories = memory_service.search_memories(user_id, query, limit)
    return jsonify({
        "status": "success",
        "memories": [m.to_dict() for m in memories]
    }), 200

@app.route('/memory/<user_id>', methods=['GET'])
def get_all_memories(user_id):
    memory_type = request.args.get('type')
    memories = memory_service.get_all_memories(user_id, memory_type)
    return jsonify({
        "status": "success",
        "memories": [m.to_dict() for m in memories]
    }), 200

@app.route('/memory/<user_id>/<int:memory_id>', methods=['DELETE'])
def delete_memory(user_id, memory_id):
    success = memory_service.delete_memory(memory_id, user_id)
    if not success:
        return generate_error_response("Memory not found", 404)
    return jsonify({
        "status": "success",
        "message": "Memory deleted"
    }), 200


@app.route('/analyze_reports', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        if 'file' not in request.files:
            return generate_error_response('No file part in the request.')
        
        file = request.files['file']
        
        if file.filename == '':
            return generate_error_response('No selected file.')

        if 'extractor_agent' not in globals() or 'consultant_agent' not in globals():
            return generate_error_response("System Error: AI agents failed to initialize. Check GOOGLE_API_KEY.", 500)

        user_id = request.form.get('user_id', 'default_user')
        session_id = request.form.get('session_id')
        
        if session_id:
            session = session_service.create_session(user_id, session_id)
        
        tmp_path = None
        try:
            suffix = os.path.splitext(file.filename)[1]
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
                file.save(tmp_file.name)
                tmp_path = tmp_file.name

            patient_profile = {
                "name": request.form.get('name', 'Unknown'),
                "age": request.form.get('age', ''), 
                "gender": request.form.get('gender', 'Unknown'),
                "history": request.form.get('history', 'None'),
                "complaints": request.form.get('complaints', 'None')
            }

            raw_json_str = extractor_agent.analyze_file(tmp_path)
            
            try:
                structured_data = json.loads(raw_json_str)
            except json.JSONDecodeError:
                return generate_error_response("Extraction Error: The AI failed to generate valid JSON data.", 500)

            if "error" in structured_data:
                return generate_error_response(f"Extraction Agent Failed: {structured_data['error']}", 500)

            doctor_summary_md = consultant_agent.generate_consultation(
                report_analysis=structured_data,
                patient_profile=patient_profile,
                json_output=False
            )

            doctor_summary_json_str = consultant_agent.generate_consultation(
                report_analysis=structured_data,
                patient_profile=patient_profile,
                json_output=True
            )
            
            if doctor_summary_md.startswith("Error generating consultation:"):
                return generate_error_response(f"Consultant Agent Failed (Markdown): {doctor_summary_md}", 500)
            
            try:
                doctor_summary_json = json.loads(doctor_summary_json_str)
                ConsultationSummaryJSON.model_validate(doctor_summary_json)
            except Exception as e:
                 return generate_error_response(f"Consultant Agent Failed (JSON parsing/validation): {str(e)}", 500)

            if session_id:
                session_service.add_event(user_id, session_id, "user", f"Analyzed report: {file.filename}")
                session_service.add_event(user_id, session_id, "assistant", doctor_summary_md[:500])

            return jsonify({
                "status": "success",
                "service": "Medical Consultation",
                "patient_profile": patient_profile,
                "structured_medical_data": structured_data,
                "consultation_summary_markdown": doctor_summary_md,
                "consultation_summary_html": markdown.markdown(doctor_summary_md),
                "consultation_summary_json": doctor_summary_json,
                "session_id": session_id
            }), 200

        except Exception as e:
            return generate_error_response(f"An unexpected server error occurred: {str(e)}", 500)
        finally:
            if tmp_path and os.path.exists(tmp_path):
                os.remove(tmp_path)

    return jsonify({
        "status": "info",
        "message": "Send a POST request with a 'file' and patient profile data to initiate analysis."
    }), 200


@app.route('/analyze_prescription', methods=['POST'])
def analyze_prescription():
    if 'file' not in request.files:
        return generate_error_response("No file part"), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return generate_error_response("No selected file"), 400

    if 'prescription_agent' not in globals():
        return generate_error_response("System Error: Prescription Agent failed to initialize.", 500)
    
    user_id = request.form.get('user_id', 'default_user')
    session_id = request.form.get('session_id')
    
    if session_id:
        session_service.create_session(user_id, session_id)
    
    tmp_path = None
    try:
        suffix = os.path.splitext(file.filename)[1]
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            file.save(tmp_file.name)
            tmp_path = tmp_file.name

        analysis_result = prescription_agent.analyze_prescription_image(tmp_path)
        
        if "error" in analysis_result:
            return generate_error_response(f"Prescription Analysis Failed: {analysis_result['error']}", 500)

        if session_id:
            session_service.add_event(user_id, session_id, "user", f"Analyzed prescription: {file.filename}")
            session_service.add_event(user_id, session_id, "assistant", json.dumps(analysis_result.get('raw_extraction', {}))[:500])

        return jsonify({
            "status": "success",
            "service": "Prescription Analysis",
            "raw_extraction": analysis_result["raw_extraction"],
            "analysis": analysis_result["analysis"],
            "session_id": session_id
        }), 200

    except Exception as e:
        return generate_error_response(f"An unexpected server error occurred during prescription analysis: {str(e)}", 500)
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)


@app.route('/doctor_assistant', methods=['POST'])
def analyze_symptoms_route():
    data = request.get_json(silent=True)
    if not data or 'symptoms' not in data:
        return generate_error_response("Missing 'symptoms' field in request JSON.", 400)
        
    symptoms = data['symptoms']
    if not symptoms or not isinstance(symptoms, str):
        return generate_error_response("Symptoms must be a non-empty string.", 400)

    if 'symptom_agent' not in globals():
        return generate_error_response("System Error: Symptom Analysis Agent failed to initialize.", 500)

    user_id = data.get('user_id', 'default_user')
    session_id = data.get('session_id')
    
    if session_id:
        session_service.create_session(user_id, session_id)

    memory_context = ""
    if user_id:
        memory_context = memory_service.get_context_for_agent(user_id, symptoms)

    try:
        analysis_json_str = symptom_agent.analyze(symptoms)
        
        try:
            analysis_data = json.loads(analysis_json_str)
        except json.JSONDecodeError:
            return generate_error_response("Analysis Error: AI failed to generate valid JSON.", 500)

        if "error" in analysis_data:
            return generate_error_response(f"Symptom Analysis Failed: {analysis_data['error']}", 500)

        if session_id:
            session_service.add_event(user_id, session_id, "user", f"Symptoms: {symptoms}")
            session_service.add_event(user_id, session_id, "assistant", format_symptom_analysis_to_markdown(analysis_data)[:500])

        return jsonify({
            "status": "success",
            "service": "Symptom Analysis",
            "input_symptoms": symptoms,
            "analysis_json": analysis_data,
            "analysis_markdown": format_symptom_analysis_to_markdown(analysis_data),
            "memory_context_used": memory_context if memory_context else None,
            "session_id": session_id
        }), 200

    except Exception as e:
        return generate_error_response(f"An unexpected server error occurred during symptom analysis: {str(e)}", 500)


@app.route('/', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "Medical AI Agent API",
        "version": "2.0",
        "features": {
            "sessions": "Database-backed session management",
            "memory": "Long-term memory storage and retrieval",
            "agents": ["report_analyzer", "prescription_reader", "doctor_assistant"]
        },
        "endpoints": {
            "sessions": {
                "POST /sessions": "Create a new session",
                "GET /sessions/<user_id>": "List all sessions for a user",
                "GET /sessions/<user_id>/<session_id>": "Get a specific session",
                "DELETE /sessions/<user_id>/<session_id>": "Delete a session",
                "POST /sessions/<user_id>/<session_id>/events": "Add an event to a session",
                "GET /sessions/<user_id>/<session_id>/events": "Get all events in a session",
                "GET /sessions/<user_id>/<session_id>/history": "Get conversation history"
            },
            "memory": {
                "POST /memory/<user_id>": "Add a memory",
                "POST /memory/<user_id>/from_session/<session_id>": "Convert session to memory",
                "GET /memory/<user_id>/search?q=<query>": "Search memories",
                "GET /memory/<user_id>": "Get all memories",
                "DELETE /memory/<user_id>/<memory_id>": "Delete a memory"
            },
            "agents": {
                "POST /analyze_reports": "Analyze medical reports",
                "POST /analyze_prescription": "Analyze prescription images",
                "POST /doctor_assistant": "Analyze symptoms"
            }
        }
    }), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
