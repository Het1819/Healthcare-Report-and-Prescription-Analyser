import os
import json
import datetime
from enum import Enum
from typing import List, Optional, Union
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# Import our loader
from document_loader import SmartLoader

# --- STRICT SCHEMA DEFINITION ---

class DocType(str, Enum):
    DIAGNOSTIC = "Diagnostic"
    CLINICAL = "Clinical"
    PROCEDURAL = "Procedural"
    ADMINISTRATIVE = "Administrative"

class LabResult(BaseModel):
    item: str = Field(..., description="Name of the analyzed item")
    value: Optional[float] = Field(None, description="Numeric value")
    unit: Optional[str] = Field(None, description="Unit")
    flag: Optional[str] = Field(None, description="High/Low/Normal")

class DiagnosticContent(BaseModel):
    test_name: Optional[str] = Field(None, description="Test Name")
    collection_date: Optional[str] = Field(None, description="ISO Date")
    results: List[LabResult] = Field(default_factory=list)

class ClinicalContent(BaseModel):
    encounter_type: Optional[str] = Field(None, description="Type")
    diagnosis_list: List[str] = Field(default_factory=list)
    chief_complaint: Optional[str] = Field(None, description="Complaint")

class ProceduralContent(BaseModel):
    procedure_name: Optional[str] = Field(None, description="Procedure Name")
    surgeon: Optional[str] = Field(None, description="Surgeon")

class AdministrativeContent(BaseModel):
    document_intent: Optional[str] = Field(None, description="Intent")

class ContentSection(BaseModel):
    diagnostic: Optional[DiagnosticContent] = None
    clinical: Optional[ClinicalContent] = None
    procedural: Optional[ProceduralContent] = None
    administrative: Optional[AdministrativeContent] = None

class PatientInfo(BaseModel):
    name: Optional[str] = Field(None, description="Patient Name")
    id: Optional[str] = Field(None, description="MRN or ID")
    dob: Optional[str] = Field(None, description="Date of Birth")

class ProviderInfo(BaseModel):
    name: Optional[str] = Field(None, description="Doctor Name")
    facility: Optional[str] = Field(None, description="Facility/Hospital")

class MetaData(BaseModel):
    doc_type: DocType = Field(..., description="Classification")
    confidence: float = Field(..., description="Confidence 0-1")
    processed_date: str = Field(default_factory=lambda: datetime.date.today().isoformat())

class MedicalRecord(BaseModel):
    meta: MetaData
    patient: PatientInfo = Field(default_factory=PatientInfo)
    provider: ProviderInfo = Field(default_factory=ProviderInfo)
    content: ContentSection
    summary: str

# --- AGENT ARCHITECTURE ---

class MultimodalMedicalAgent:
    def __init__(self, model_name: str = "gemini-2.0-flash"):
        self.api_key = os.getenv("GOOGLE_API_KEY", "")
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = model_name
        self.loader = SmartLoader()

        self.system_instruction = """
### ROLE
You are an expert Medical AI Agent. You accept input as raw text, images (scans), or PDFs.

### OBJECTIVE
1. CLASSIFY the document (Diagnostic, Clinical, Procedural, Administrative).
2. EXTRACT entities accurately into the provided schema.
3. OUTPUT strict JSON that conforms exactly to the MedicalRecord schema.

### RULES
- If the input is an image/PDF, visually analyze checkboxes, handwritten text, and layout.
- If text is illegible or a field is not present, mark the field as null or omit it according to the schema.
- Maintain patient privacy (Extract entities exactly).
"""

    def analyze_file(self, file_path: str) -> str:
        print(f"--- Processing: {file_path} ---")
        
        # 1. Load File using SmartLoader
        try:
            content_payload: Union[str, types.Part, None] = self.loader.process_file(file_path)
            if content_payload is None:
                return json.dumps({"error": "Failed to load file"})
        except Exception as e:
            return json.dumps({"error": f"Loader Error: {str(e)}"})

        # 2. Call Gemini
        try:
            # content_payload can be a string (for text) or types.Part (for image/pdf bytes)
            contents_list = [content_payload] 
            
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=contents_list, 
                config=types.GenerateContentConfig(
                    system_instruction=self.system_instruction,
                    response_mime_type="application/json",
                    response_schema=MedicalRecord,
                    temperature=0.1
                )
            )
            return response.text
            
        except Exception as e:
            return json.dumps({"error": f"API Error: {str(e)}"})