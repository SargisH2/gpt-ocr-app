import base64
import zipfile
import json
from io import BytesIO
from fastapi import APIRouter, File, UploadFile
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.requests import Request
from jinja2 import Template
from typing import List
from app.services import DocumentIntelligenceService

router = APIRouter()

agent = DocumentIntelligenceService()

with open("app/templates/upload_template.html") as f:
    upload_template = f.read()

@router.get("/")
async def gpt_ocr_interface(request: Request):
    template = Template(upload_template)
    html_content = template.render()
    return HTMLResponse(content=html_content)

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_content = await file.read()
    pdf_encoded = base64.b64encode(file_content).decode('utf-8')
    answer = agent.analyze(pdf_encoded, is_url=False)
    return answer

@router.post("/upload-multiple")
async def upload_multiple_files(files: List[UploadFile] = File(...)):
    try:
        results = []
        for file in files:
            file_content = await file.read()
            pdf_encoded = base64.b64encode(file_content).decode('utf-8')
            answer = agent.analyze(pdf_encoded, is_url=False)
            results.append(answer)
        return results
    except Exception as e:
        return {'Error': str(e)}

@router.post("/create-zip")
async def create_zip(data: List[dict]):
    buffer = BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
        for i, item in enumerate(data):
            json_content = json.dumps(item, indent=2)
            zip_file.writestr(f"result_{i + 1}.json", json_content)
    buffer.seek(0)
    return StreamingResponse(buffer, media_type="application/zip", headers={"Content-Disposition": "attachment; filename=results.zip"})
