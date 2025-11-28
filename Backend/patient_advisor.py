import os
import json
from typing import Dict, Any, Union, Optional, List
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

# --- Pydantic Schema for JSON Consultation Output (NEW) ---\n

class KeyFinding(BaseModel):
    parameter_name: str
    status: str = Field(..., description="High, Low, or Normal")
    interpretation: str = Field(..., description="Simple English explanation of the finding.")
    image_tag: Optional[str] = Field(
        None,
        description="Optional image tag for visualization (e.g. '[Image of X]')."
    )

class ConsultationSummaryJSON(BaseModel):
    overall_summary: str = Field(..., description="A 2-sentence summary of the overall health status.")
    key_findings: List[KeyFinding] = Field(default_factory=list)
    lifestyle_recommendations: List[str] = Field(..., description="Three specific lifestyle or dietary tips.")
    when_to_see_doctor: List[str] = Field(..., description="Specific symptoms or red flags requiring attention.")
    disclaimer: str = Field(default="I am an AI assistant. This analysis is for informational purposes and does not replace professional medical advice.")


class PatientConsultantAgent:
    """
    Agent 2: The Medical Consultant (Synthesizer).
    
    Role: 
    Takes structured JSON output from the MultimodalMedicalAgent (Agent 1) 
    and an OPTIONAL Patient Profile, then generates a personalized, empathetic, 
    and professional medical summary.
    """
    
    def __init__(self, model_name: str = "gemini-2.0-flash"):
        self.api_key = os.getenv("GOOGLE_API_KEY", "")
        if not self.api_key:
            print("WARNING: GOOGLE_API_KEY not found in environment variables.")
            
        self.client = genai.Client(api_key=self.api_key)
        self.model_name = model_name

        # System instruction for MARKDOWN output (default behavior)
        self.markdown_system_instruction = """
### SYSTEM ROLE
You are a senior, empathetic, and professional Medical Consultant AI. Your task is to interpret a technical medical report analysis for a specific patient. You must bridge the gap between complex medical data and patient understanding.

### RESPONSE GUIDELINES
1. **Tone:** Professional yet warm. 
2. **Prioritization:** Start with the most critical findings (Red Flags). 
3. **Correlation:** Explain what findings mean in simple English. Insert a diagram tag (e.g., 

[Image of X]
) on a new line if helpful.
4. **Actionable Advice:** Provide 3 specific lifestyle/dietary recommendations.
5. **Safety Guardrails:** Do NOT diagnose or prescribe medication. ALWAYS end with a medical disclaimer.

### REQUIRED OUTPUT FORMAT (Markdown)
## 🩺 Dr. AI Summary

**1. The Big Picture**
(A 2-sentence summary of the overall health status shown in the report.)

**2. Key Findings (Explained)**
- **[Parameter Name]:** [Status: High/Low/Normal]
  - *Interpretation:* (Explain what this means in simple English.)
  (Insert tag here if helpful for explanation)

**3. 🥗 Lifestyle & Dietary Recommendations**
- (Tip 1)
- (Tip 2)
- (Tip 3)

**4. ⚠️ When to see a Human Doctor**
(Specific symptoms or red flags that require immediate attention.)

---
*Disclaimer: I am an AI assistant. This analysis is for informational purposes and does not replace professional medical advice.*
"""


    def generate_consultation(self, report_analysis: Union[Dict, str], patient_profile: Optional[Dict[str, Any]] = None, json_output: bool = False) -> str:
        """
        Generates the formatted consultation report.

        Args:
            report_analysis (dict or str): The structured JSON output from Agent 1 (MANDATORY).
            patient_profile (dict, optional): Dict containing 'name', 'age', 'gender', 'history', 'complaints'. (OPTIONAL).
            json_output (bool): If True, returns strict JSON conforming to ConsultationSummaryJSON schema.

        Returns:
            str: The Markdown formatted doctor's summary OR a JSON string.
        """
        
        # 1. Handle Optional Profile
        if patient_profile:
            age = patient_profile.get('age')
            if not age:
                age = 'Unknown'

            profile_str = f"""
            - Name: {patient_profile.get('name', 'Patient')}
            - Age: {age}
            - Gender: {patient_profile.get('gender', 'Unknown')}
            - Medical History: {patient_profile.get('history', 'None provided')}
            - Current Complaints: {patient_profile.get('complaints', 'None provided')}
            """
        else:
            profile_str = "No specific patient profile provided. Interpret the report based on general medical standards."

        # 2. Ensure Report Data is a string for the prompt
        if isinstance(report_analysis, dict):
            report_str = json.dumps(report_analysis, indent=2)
        else:
            report_str = str(report_analysis)

        # 3. Construct the Synthesizer Prompt
        user_prompt = f"""
        Please generate a consultation summary based on the following context:

        ### PATIENT PROFILE
        {profile_str}

        ### INPUT DATA (From Report Analyser Agent)
        {report_str}
        """

        config_args = {
            "system_instruction": self.markdown_system_instruction,
            "temperature": 0.4
        }

        if json_output:
            # Override system instruction and set JSON schema for strict output
            config_args["system_instruction"] = self.markdown_system_instruction.replace('REQUIRED OUTPUT FORMAT (Markdown)', 'REQUIRED OUTPUT FORMAT (JSON)').replace('## 🩺 Dr. AI Summary', 'Generate the JSON strictly following the schema:')
            config_args["response_mime_type"] = "application/json"
            config_args["response_schema"] = ConsultationSummaryJSON

        # 4. Call Gemini
        try:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=user_prompt,
                config=types.GenerateContentConfig(**config_args)
            )
            return response.text
            
        except Exception as e:
            return f"Error generating consultation: {str(e)}"