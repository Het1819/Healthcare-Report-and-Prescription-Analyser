import os
import json
from dotenv import load_dotenv
from google import genai
from google.genai import types
from pydantic import BaseModel, Field # NEW: Import Pydantic
from typing import List, Optional # NEW: Import List

load_dotenv()

# --- Pydantic Schema for Symptom Analysis Output ---

class SymptomAnalysisResult(BaseModel):
    """Defines the structured output for the symptom analysis."""
    disclaimer_and_urgency: str = Field(..., description="A clear, mandatory disclaimer that this is not a diagnosis, including advice on when to seek immediate emergency care.")
    current_condition_analysis: str = Field(..., description="Description of what the user might be currently experiencing in simple terms (e.g., inflammation, respiratory distress, muscular pain).")
    possible_medical_problems: List[str] = Field(..., description="A list of 3-5 of the most common and likely medical conditions associated with the symptoms.")
    immediate_actions: List[str] = Field(..., description="A list of 2 immediate actions the user can take (e.g., rest, hydration).")
    recommended_specialist: str = Field(..., description="The most appropriate specialist or hospital department to visit.")
    final_statement: str = Field(..., description="Must be the exact phrase: 'Connect the doctor/hospital near your location.'")

class DoctorAssistant:
    """
    AI Agent for preliminary symptom analysis and guidance.
    Uses a Chain-of-Thought (CoT) prompt structure to generate
    a safe, structured, non-diagnostic response.
    """

    def __init__(self, model_name: str = "gemini-2.5-flash"):
        self.api_key = os.getenv("GOOGLE_API_KEY", "")
        self.client = genai.Client(api_key=self.api_key)
        self.model = model_name

    def analyze(self, symptoms: str) -> str:
        """
        Analyzes user-provided symptoms and generates a structured advisory response in JSON format.
        
        Args:
            symptoms: A string describing the user's symptoms.
            
        Returns:
            A JSON string conforming to the SymptomAnalysisResult schema.
        """
        
        prompt = f"""
        ### SYSTEM ROLE: Structured Medical Advisor
        You are an expert medical assistant providing preliminary, non-diagnostic guidance. Your response must be highly structured, cautious, and helpful. You MUST start your analysis by generating the **disclaimer_and_urgency** field first.

        ### USER INPUT
        Symptoms: {symptoms}

        ### INSTRUCTIONS
        1. Fill all fields of the required JSON schema.
        2. Ensure the "final_statement" field contains the exact phrase: "Connect the doctor/hospital near your location."
        """

        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    # NEW: Request strict JSON output using the Pydantic schema
                    response_mime_type="application/json",
                    response_schema=SymptomAnalysisResult
                )
            )
            # The model returns a JSON string that conforms to the schema
            return response.text
        except Exception as e:
            # Handle error and return a JSON string containing the error for reliable parsing in the Flask app
            return json.dumps({"error": f"Error analyzing symptoms: {str(e)}"})