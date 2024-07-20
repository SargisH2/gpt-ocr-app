from pydantic import BaseModel

class OCRRequest(BaseModel):
    pdf_encoded: str
