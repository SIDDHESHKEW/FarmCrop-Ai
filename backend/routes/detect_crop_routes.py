from fastapi import APIRouter, File, HTTPException, UploadFile

try:
    from backend.controllers.detect_crop_controller import detect_crop_controller
except ModuleNotFoundError:
    from controllers.detect_crop_controller import detect_crop_controller

router = APIRouter()


@router.post("/detect-crop")
async def detect_crop(file: UploadFile = File(...)):
    try:
        return await detect_crop_controller(file)
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Failed to detect crop") from exc
