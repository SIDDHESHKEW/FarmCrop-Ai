# Backend Run Guide

## Location
You can run from either directory:
- Repo root: E:/Desktop E-Drive/Projects/Hackthon projects/FarmerCrop AI/Men-in-black_SKB-F11_SBK-P3
- Backend folder: E:/Desktop E-Drive/Projects/Hackthon projects/FarmerCrop AI/Men-in-black_SKB-F11_SBK-P3/backend

## Prerequisites
- Python virtual environment already exists at .venv (project root)

## Install dependencies
Use the backend virtual environment Python:

```powershell
& "./.venv/Scripts/python.exe" -m pip install fastapi uvicorn numpy scikit-learn reportlab pdfkit
```

Install wkhtmltopdf (required by pdfkit) and ensure `wkhtmltopdf` is available in PATH.

## Start backend server
If you run from repo root:

```powershell
Set-Location "e:/Desktop E-Drive/Projects/Hackthon projects/FarmerCrop AI/Men-in-black_SKB-F11_SBK-P3"
& "e:/Desktop E-Drive/Projects/Hackthon projects/FarmerCrop AI/.venv/Scripts/python.exe" -m uvicorn backend.main:app --reload
```

If you run from backend folder directly, use:

```powershell
Set-Location "e:/Desktop E-Drive/Projects/Hackthon projects/FarmerCrop AI/Men-in-black_SKB-F11_SBK-P3/backend"
& "e:/Desktop E-Drive/Projects/Hackthon projects/FarmerCrop AI/.venv/Scripts/python.exe" -m uvicorn main:app --reload
```

## API docs
- http://127.0.0.1:8000/docs

## Test /predict quickly

```powershell
$body = @{ region = 'Punjab'; scenario = 'RCP_8.5'; genotypes = @('G-101','G-102') } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/predict' -Method Post -ContentType 'application/json' -Body $body | ConvertTo-Json -Depth 5
```

