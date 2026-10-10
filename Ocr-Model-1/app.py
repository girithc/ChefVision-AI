import os
from pathlib import Path
from uuid import uuid4
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from ocr_invoice import extract_invoice

app = FastAPI()

# Create a temporary directory for uploads
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
MAX_UPLOAD_BYTES = int(os.getenv("MAX_UPLOAD_BYTES", str(10 * 1024 * 1024)))
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}

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

    suffix = ALLOWED_IMAGE_TYPES.get(file.content_type or "")
    if not suffix:
        raise HTTPException(status_code=415, detail="Only JPEG, PNG, and WebP images are supported")

    file_path = os.path.join(UPLOAD_DIR, f"{uuid4().hex}{suffix}")
    size = 0
    too_large = False
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 1024):
            size += len(chunk)
            if size > MAX_UPLOAD_BYTES:
                too_large = True
                break
            buffer.write(chunk)
    if too_large:
        Path(file_path).unlink(missing_ok=True)
        raise HTTPException(status_code=413, detail="Upload exceeds the configured size limit")
    
    try:
        # Run OCR extraction
        result = extract_invoice(file_path)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Optionally clean up the uploaded file to save space
        Path(file_path).unlink(missing_ok=True)
