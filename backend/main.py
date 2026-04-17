from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
	from backend.routes.predict_routes import router as predict_router
except ModuleNotFoundError:
	from routes.predict_routes import router as predict_router

try:
	from backend.routes.pdf_routes import router as pdf_router
except ModuleNotFoundError:
	from routes.pdf_routes import router as pdf_router

try:
	from backend.routes.detect_crop_routes import router as detect_crop_router
except ModuleNotFoundError:
	from routes.detect_crop_routes import router as detect_crop_router

try:
	from backend.routes.shap_routes import router as shap_router
except ModuleNotFoundError:
	try:
		from routes.shap_routes import router as shap_router
	except ModuleNotFoundError:
		shap_router = None

app = FastAPI(title="FutureCrop AI")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

app.include_router(predict_router)
app.include_router(pdf_router)
app.include_router(detect_crop_router)
if shap_router is not None:
	app.include_router(shap_router)
