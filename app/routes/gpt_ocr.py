import logging
from fastapi import APIRouter
from app.models import OCRRequest
from fastapi.responses import JSONResponse
from app.services import DocumentIntelligenceService

router = APIRouter()

agent = DocumentIntelligenceService()

@router.post("/gpt_ocr")
async def gpt_ocr(request: OCRRequest):
    logging.info('Python HTTP trigger function processed a request.')
    pdf_encoded = request.pdf_encoded
    try:
        logging.info('Reading pdf...')
        answer = agent.analyze(pdf_encoded, is_url=False)
        return JSONResponse(content=answer)
    except Exception as e:
        return JSONResponse(content={'error': str(e)}, status_code=500)
