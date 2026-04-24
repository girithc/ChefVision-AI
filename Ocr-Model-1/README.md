# Invoice OCR Analyzer

This project is a web-based Optical Character Recognition (OCR) analyzer designed to extract structured data from invoice images using Tesseract OCR and OpenCV. It features a modern web UI powered by a FastAPI backend.

## Prerequisites
- Python 3.x
- Homebrew (for macOS users) to install Tesseract OCR
- Virtual environment with the required dependencies

### Installing System Requirements
You need to have `tesseract` installed on your machine so the Python wrapper can use it.
```bash
brew install tesseract
```

## Running the Web App

The application uses a lightweight FastAPI server to provide the frontend interface and handle file uploads.

1. **Activate the Virtual Environment**
   Make sure you are in the project folder and activate your virtual environment:
   ```bash
   source .venv/bin/activate
   ```

2. **Start the FastApi Server**
   Run the following command to start the backend server:
   ```bash
   uvicorn app:app --reload
   ```

3. **Open the Web Interface**
   Open your web browser and navigate to:
   [http://localhost:8000](http://localhost:8000)

4. **Use the App!**
   - Drag and drop an invoice image (like the included `sample_invoice.jpg`) onto the upload zone.
   - The analysis will extract vendor details, totals, and line items.
   - You can review and edit line items directly in the table, and export them natively to a CSV file!

## Project Structure
- `app.py`: The FastAPI server that handles image uploads and routes to the OCR logic.
- `ocr_invoice.py`: The core script that utilizes OpenCV and Tesseract to extract line items and financial data.
- `static/`: Contains the front-end web files (`index.html`, `style.css`, `app.js`).
- `uploads/`: Temporary directory where images are saved during processing (they are deleted immediately after).
- `sample_invoice.jpg`: Readily available sample image to test the analyzer.
