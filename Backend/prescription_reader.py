import os
import json
from typing import Dict, Any
from google import genai
from google.genai import types
from PIL import Image
import io # NEW: Import io for in-memory byte buffer
from dotenv import load_dotenv

load_dotenv()

class PrescriptionReaderAgent:
    """
    Agent responsible for analyzing prescription images.
    It combines two steps: OCR extraction (Prescription Reader Agent) 
    and drug knowledge explanation (Medicine Knowledge Agent).
    """

    def __init__(self, model_name: str = "gemini-2.0-flash"):
        self.api_key = os.getenv("GOOGLE_API_KEY", "")
        # Using a client for consistency with other agents
        self.client = genai.Client(api_key=self.api_key)
        self.vision_model = 'gemini-2.5-flash-lite'
        self.knowledge_model = 'gemini-2.5-flash-lite'
        
    def _extract_medicines(self, image_input: Image.Image) -> Dict[str, Any]:
        """
        [Agent 1: Prescription Reader Agent]
        Scans the image and finds medicine names/forms using Gemini Vision.
        Returns a dictionary with extracted data or an 'error' key on failure.
        """
        prompt = """
        You are an expert Pharmacist. 
        1. Identify ONLY medicine names and forms from the image.
        2. Classify forms into: "Tablets", "Capsules", "Cream", "Syrup", "Drops", etc.
        3. Output strictly this JSON format and nothing else:
           {"medicines": [{"name": "MedName", "form": "MedForm"}]}
        """
        try:
            # --- FIX: Convert PIL Image to Bytes in Memory for robust Part creation ---
            img_byte_arr = io.BytesIO()
            # Save the image as JPEG (adjust format based on input if necessary, but JPEG is usually robust)
            image_input.save(img_byte_arr, format=image_input.format if image_input.format else 'JPEG')
            img_byte_arr = img_byte_arr.getvalue()
            
            # Create the Part from the byte stream
            mime_type = f"image/{image_input.format.lower() if image_input.format else 'jpeg'}"
            img_bytes = types.Part.from_bytes(data=img_byte_arr, mime_type=mime_type)
            # -----------------------------------------------------------------------
            
            response = self.client.models.generate_content(
                model=self.vision_model,
                contents=[prompt, img_bytes], 
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.1
                )
            )
            
            clean_text = response.text.strip().replace('```json', '').replace('```', '')
            
            try:
                return json.loads(clean_text)
            except json.JSONDecodeError as json_e:
                error_message = f"JSON Decode Error: Model returned malformed data. {json_e}. Raw: {clean_text[:100]}..."
                print(f"Prescription Reader Agent (JSON Decode Error): {error_message}")
                return {"error": error_message}
            
        except Exception as e:
            error_message = f"API or Connection Error: {str(e)}"
            print(f"Prescription Reader Agent (Extraction) Error: {error_message}")
            return {"error": error_message}


    def _explain_medicines(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        [Agent 2: Medicine Knowledge Agent]
        Takes the list of medicines and explains them using Gemini Knowledge.
        Returns a dictionary with analysis or an 'error' key on failure.
        """
        prompt = f"""
        You are an expert Pharmacist. 
        INPUT: {json.dumps(data)}
        
        TASK: For each medicine, provide a patient-friendly summary.
        OUTPUT JSON format:
        {{
            "MedicineName": {{
                "purpose": "Brief reason for use",
                "side_effects": "2-3 common side effects",
                "interactions": "1 major warning"
            }}
        }}
        """
        try:
            response = self.client.models.generate_content(
                model=self.knowledge_model,
                contents=[prompt],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.4
                )
            )
            clean_text = response.text.strip().replace('```json', '').replace('```', '')
            
            try:
                return json.loads(clean_text)
            except json.JSONDecodeError as json_e:
                error_message = f"JSON Decode Error: Explanation model returned malformed data. {json_e}. Raw: {clean_text[:100]}..."
                print(f"Medicine Knowledge Agent (JSON Decode Error): {error_message}")
                return {"error": error_message}
                
        except Exception as e:
            error_message = f"API or Connection Error: {str(e)}"
            print(f"Medicine Knowledge Agent (Explanation) Error: {error_message}")
            return {"error": error_message}
            
    def analyze_prescription_image(self, file_path: str) -> Dict[str, Any]:
        """
        Main orchestration function for the two-step analysis.
        """
        try:
            image = Image.open(file_path)
            
            raw_data = self._extract_medicines(image)
            # Check for error key in the dictionary returned by _extract_medicines
            if "error" in raw_data:
                return {"error": f"Failed to extract medicines from image: {raw_data['error']}"}
            
            final_report = self._explain_medicines(raw_data)
            # Check for error key in the dictionary returned by _explain_medicines
            if "error" in final_report:
                return {"error": f"Failed to generate explanation report: {final_report['error']}"}

            return {
                "status": "success",
                "raw_extraction": raw_data,
                "analysis": final_report
            }
        except Exception as e:
            return {"error": f"Internal Agent Error: {str(e)}"}