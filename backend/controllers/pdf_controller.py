import logging

try:
    from backend.services.pdf_service import generate_blueprint_pdf
except ModuleNotFoundError:
    from services.pdf_service import generate_blueprint_pdf


logger = logging.getLogger(__name__)


def generate_pdf_controller(request):
    features = [item.model_dump() for item in request.features][:3]
    while len(features) < 3:
        features.append({"name": "N/A", "impact": 0.0})

    prediction_values = request.prediction_values or {
        "yield": request.yield_value,
        "confidence": request.confidence,
    }

    logger.info(
        "PDF request received: crop=%s region=%s scenario=%s genotype_id=%s yield=%.2f confidence=%.2f",
        request.crop,
        request.region,
        request.scenario,
        request.genotype_id,
        request.yield_value,
        request.confidence,
    )

    recommendation = (
        f"Prioritize {request.crop} in {request.region} under {request.scenario}. "
        f"Target genotype: {request.genotype_id or 'N/A'}. "
        "Use heat and drought adaptive genotypes to stabilize yield under projected forcing."
    )

    payload = {
        "region": request.region,
        "scenario": request.scenario,
        "crop": request.crop,
        "genotype_id": request.genotype_id,
        "yield": request.yield_value,
        "confidence": request.confidence,
        "prediction_values": prediction_values,
        "temperature": request.temperature,
        "rainfall": request.rainfall,
        "co2": request.co2,
        "features": features,
        "recommendation": recommendation,
        "hash": request.hash,
    }
    return generate_blueprint_pdf(payload)
