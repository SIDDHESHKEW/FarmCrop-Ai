from fastapi import UploadFile

try:
    from backend.services.detect_crop_service import detect_crop_from_image
except ModuleNotFoundError:
    from services.detect_crop_service import detect_crop_from_image


async def detect_crop_controller(file: UploadFile) -> dict:
    image_bytes = await file.read()
    crop = detect_crop_from_image(file.filename, image_bytes)
    return {"crop": crop}
