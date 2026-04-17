# Backend Run Guide

## Location
You can run from either directory:
- Project root: E:/Desktop E-Drive/Projects/Hackthon projects/FarmerCrop AI
- Backend folder: E:/Desktop E-Drive/Projects/Hackthon projects/FarmerCrop AI/backend

## Prerequisites
- Python virtual environment already exists at backend/.venv

## Install dependencies
Use the backend virtual environment Python:

```powershell
& "./.venv/Scripts/python.exe" -m pip install fastapi uvicorn
```

## Start backend server
If you run from project root:

```powershell
& "./backend/.venv/Scripts/python.exe" -m uvicorn backend.main:app --reload
```

If you run from backend folder directly, use:

```powershell
& "./.venv/Scripts/python.exe" -m uvicorn main:app --reload
```

## API docs
- http://127.0.0.1:8000/docs

## Test /predict quickly

```powershell
$body = @{ region = 'Punjab'; scenario = 'RCP_8.5'; genotypes = @('G-101','G-102') } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://127.0.0.1:8000/predict' -Method Post -ContentType 'application/json' -Body $body | ConvertTo-Json -Depth 5
```

look this commit

