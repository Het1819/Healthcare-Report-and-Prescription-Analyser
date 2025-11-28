# **🏥 AI-Powered Healthcare Report & Prescription Analyzer**

**Kaggle Agents Intensive Capstone Project Submission**

Track: Agents for Good  
Goal: Democratizing access to medical record understanding through autonomous multi-agent systems.

## **📖 Overview**

The **Healthcare Report & Prescription Analyzer** is an intelligent multi-agent system designed to help patients understand complex medical documents. By leveraging **Google's Gemini 2.0 and 2.5 models**, the system can analyze diagnostic reports, decipher handwritten prescriptions, and provide preliminary symptom triage—all explained in simple, patient-friendly language.

Unlike standard chatbots, this project uses a **Multi-Agent Architecture** where specialized agents (Doctor, Consultant, Reader) collaborate to process multimodal inputs (text, images, PDFs) and maintain long-term memory of patient history.

## **✨ Key Features**

* **📄 Smart Report Analysis:** Upload generic blood work or diagnostic reports (PDF/Images). The MultimodalMedicalAgent extracts strict structured data (lab results, flags) and provides a "Consultant's Summary" explaining what the numbers mean.  
* **💊 Prescription Deciphering:** Upload a photo of a handwritten prescription. The PrescriptionReaderAgent extracts medicine names, dosages, and instructions using advanced vision capabilities.  
* **🩺 Symptom Triage:** Chat with the DoctorAssistant about your symptoms. It uses a Chain-of-Thought approach to provide safety-first guidance, immediate actions, and specialist recommendations.  
* **🧠 Long-Term Memory:** Built on SQLite, the system remembers past sessions and user context, allowing for personalized interactions across different consultations.

## **🤖 Agent Architecture**

This project implements a modular multi-agent system powered by the **Google GenAI SDK**:

1. **Multimodal Medical Agent (gemini-2.0-flash):**  
   * *Role:* Extracts entities (patient info, lab results) from unstructured files.  
   * *Tools:* Custom SmartLoader for document processing.  
   * *Output:* Strict JSON schema for medical records.  
2. **Patient Consultant Agent:**  
   * *Role:* "The Translator." Takes raw medical data and generates a human-readable, empathetic summary in Markdown/HTML.  
3. **Prescription Reader Agent:**  
   * *Role:* OCR and analysis specialist for handwritten pharmacy notes.  
4. **Doctor Assistant (gemini-2.5-flash):**  
   * *Role:* Triage agent.  
   * *Behavior:* Enforces strict safety protocols (disclaimers first) and outputs structured advice (Immediate Actions, Specialist Referral).

### **System Flow**

graph TD  
    User\[User / Frontend\] \--\>|Upload Report| API\[Flask API\]  
    User \--\>|Text Symptoms| API  
      
    API \--\>|Route: Report| Extractor\[Multimodal Medical Agent\]  
    Extractor \--\>|Raw Data| Consultant\[Patient Consultant Agent\]  
    Consultant \--\>|Summary| API  
      
    API \--\>|Route: Symptoms| Memory\[Memory Service (SQLite)\]  
    Memory \--\>|Context| Doctor\[Doctor Assistant\]  
    Doctor \--\>|Advice| API

## **🛠️ Tech Stack**

* **Frontend:** React 19, Vite, Tailwind CSS  
* **Backend:** Python 3.11, Flask  
* **AI Models:** Google Gemini 2.0 Flash, Gemini 2.5 Flash  
* **Database:** SQLite (SQLAlchemy) for Session & Memory management  
* **Validation:** Pydantic for strict JSON output parsing

## **🚀 Getting Started**

### **Prerequisites**

* Node.js & npm  
* Python 3.11+  
* Google Cloud API Key (with access to Gemini models)

### **1\. Backend Setup**

cd Backend

\# Create virtual environment  
python \-m venv .venv  
source .venv/bin/activate  \# On Windows: .\\.venv\\Scripts\\Activate.ps1

\# Install dependencies  
pip install \-r requirements.txt

\# Configure Environment  
\# Create a .env file in the Backend folder  
echo "GOOGLE\_API\_KEY=your\_actual\_api\_key\_here" \> .env  
echo "FLASK\_SECRET\_KEY=your\_secret\_key" \>\> .env

\# Run the Server  
python app.py

*The backend will start on http://localhost:5001*

### **2\. Frontend Setup**

cd Frontend

\# Install dependencies  
npm install

\# Run the Development Server  
npm run dev

*The frontend will start on http://localhost:5173*

## **📸 Demo & Usage**

### **1\. Analyze a Report**

Navigate to the "Analyze Report" tab. Upload a sample blood test PDF. The agent will extract the values and warn you about any abnormal metrics (High/Low flags).

### **2\. Check Symptoms**

Go to the "Doctor Assistant" page. Type: *"I have a severe headache and sensitivity to light."* The agent will check your history (Memory) and suggest immediate actions (e.g., dimming lights, hydration) while advising a visit to a Neurologist.

*(Placeholder: Add link to YouTube Demo Video here)*

## **🏆 Capstone Implementation Details**

This project specifically addresses the **Agents for Good** track by utilizing:

* **Multi-Agent Orchestration:** Separation of concerns between extraction (Vision) and consultation (Reasoning).  
* **Tool Use:** The document\_loader.py acts as a retrieval tool for the agents.  
* **Structured Output:** All agents utilize strict JSON schemas (via Pydantic) to ensure the UI never breaks, demonstrating production-readiness.  
* **Memory Integration:** The memory\_service.py captures context from previous interactions to make the agent "smarter" over time.

## **⚠️ Disclaimer**

*This project is an AI prototype for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician.*

*Built for the Google AI Agents Intensive 2025\.*
