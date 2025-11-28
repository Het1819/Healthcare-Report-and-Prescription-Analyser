import os
import io
from typing import Union, List, Any
from pypdf import PdfReader
import docx
from PIL import Image
from google.genai import types

class SmartLoader:
    """
    Handles loading of various file types for the Medical Agent.
    Strategies:
    - DOCX: Always text extraction.
    - PDF:  Try text extraction first. If text is sparse (scanned), use Multimodal (Vision).
    - IMG:  Always Multimodal (Vision).
    """
    
    @staticmethod
    def load_docx(file_path: str) -> str:
        """Extracts text from a .docx file."""
        doc = docx.Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        return "\n".join(full_text)

    @staticmethod
    def load_pdf(file_path: str) -> Union[str, types.Part]:
        """
        Smart PDF Loader:
        1. Tries to extract text using pypdf.
        2. If text length is sufficient, returns text (Save tokens).
        3. If text is sparse (likely scanned), returns raw PDF bytes for Gemini Vision.
        """
        try:
            reader = PdfReader(file_path)
            text_content = ""
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text_content += extracted + "\n"
            
            # HEURISTIC: If we extracted less than 50 chars per page on average, 
            # it's likely a scanned document or image-heavy. Use Vision.
            if len(text_content) < (50 * len(reader.pages)):
                print(f"[Loader] PDF '{os.path.basename(file_path)}' appears scanned. Using Gemini Vision.")
                with open(file_path, "rb") as f:
                    pdf_bytes = f.read()
                return types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf")
            
            print(f"[Loader] PDF '{os.path.basename(file_path)}' processed as text.")
            return text_content

        except Exception as e:
            print(f"Error reading PDF: {e}")
            return ""

    @staticmethod
    def load_image(file_path: str) -> types.Part:
        """Loads an image for Gemini Vision."""
        try:
            # Verify it's a valid image
            with Image.open(file_path) as img:
                img.verify() 
            
            with open(file_path, "rb") as f:
                img_bytes = f.read()
            
            # Determine mime type (default to jpeg if unknown/png)
            mime_type = "image/jpeg"
            if file_path.lower().endswith(".png"):
                mime_type = "image/png"
                
            return types.Part.from_bytes(data=img_bytes, mime_type=mime_type)
        except Exception as e:
            print(f"Error reading Image: {e}")
            return None

    def process_file(self, file_path: str) -> Union[str, types.Part, None]:
        """Main entry point to route file to correct handler."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found: {file_path}")
            
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext == ".docx":
            return self.load_docx(file_path)
        elif ext == ".pdf":
            return self.load_pdf(file_path)
        elif ext in [".jpg", ".jpeg", ".png"]:
            return self.load_image(file_path)
        elif ext == ".txt":
            with open(file_path, "r") as f:
                return f.read()
        else:
            raise ValueError(f"Unsupported file format: {ext}")