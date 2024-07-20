import logging
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from app.routes import gpt_ocr, upload

logging.basicConfig(filename='logs/app.log', level=logging.INFO)

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")
app.include_router(gpt_ocr.router)
app.include_router(upload.router)

# @app.get("/")
# async def read_root():
#     logging.info('app launched!')
#     return {"message": "Welcome to the FastAPI application!"}
