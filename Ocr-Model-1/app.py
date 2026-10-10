import os
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from ocr_invoice import extract_invoice
from upload_policy import safe_upload_path, write_limited_upload

app = FastAPI()

# Create a temporary directory for uploads
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))

# Mount the static directory to serve HTML/CSS/JS
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("static/index.html", "r") as f:
        return HTMLResponse(content=f.read(), status_code=200)

@app.post("/api/extract")
async def extract_invoice_api(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    try:
        file_path = safe_upload_path(UPLOAD_DIR, file.content_type)
        await write_limited_upload(file, file_path, MAX_UPLOAD_BYTES)
    except ValueError as error:
        raise HTTPException(status_code=415, detail=str(error)) from error
    except OverflowError as error:
        raise HTTPException(status_code=413, detail=str(error)) from error
    
    try:
        # Run OCR extraction
        result = extract_invoice(str(file_path))
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Optionally clean up the uploaded file to save space
        file_path.unlink(missing_ok=True)
