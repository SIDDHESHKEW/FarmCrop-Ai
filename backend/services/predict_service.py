import hashlib
import logging

import numpy as np

try:
    from backend.services.weather_service import get_weather
except ModuleNotFoundError:
    from services.weather_service import get_weather


logger = logging.getLogger(__name__)


def generate_deterministic_snp_features(genotype: str, num_features: int = 20) -> np.ndarray:
    """Create a deterministic SNP vector (0..1) from genotype text.

    Same genotype id always maps to the same SNP feature values.
    """
    features: list[float] = []
    counter = 0
    while len(features) < num_features:
        digest = hashlib.sha256(f"{genotype}:{counter}".encode("utf-8")).digest()
        for byte in digest:
            features.append(byte / 255.0)
            if len(features) == num_features:
                break
        counter += 1
    return np.array(features, dtype=float)


def compute_genetic_score(genetic_vector: np.ndarray) -> float:
    # Genetic score: weighted contribution from first SNPs (higher weight on key loci).
    weights = np.array([0.38, 0.28, 0.18, 0.10, 0.06], dtype=float)
    weighted_sum = float(np.dot(genetic_vector[:5], weights))
    return 2.5 * weighted_sum


def normalize_soil(soil: str | None) -> str:
    if not soil:
        return "default"
    return soil.strip().lower()


def get_soil_adjustments(soil: str | None):
    normalized = normalize_soil(soil)

    # Values are tuned for simulation behavior, not agronomic calibration.
    if any(token in normalized for token in ["black", "clay", "loam", "alluvial"]):
        return -0.3, 0.08, 0.03
    if any(token in normalized for token in ["sandy", "sand", "laterite", "gravel"]):
        return 0.2, -0.1, -0.03
    if any(token in normalized for token in ["saline", "alkaline", "acidic", "rocky"]):
        return 0.4, -0.12, -0.05

    return 0.0, 0.0, 0.0


def get_climate_factors(scenario, soil: str | None = None):
    if "8.5" in scenario:
        temperature = 38
        rainfall = 160
        co2 = 560
    elif "4.5" in scenario:
        temperature = 34
        rainfall = 210
        co2 = 480
    else:
        temperature = 30
        rainfall = 250
        co2 = 420

    temp_delta, rainfall_delta, par_delta = get_soil_adjustments(soil)
    temperature += temp_delta
    rainfall = min(max(rainfall + (rainfall_delta * 100.0), 80.0), 400.0)
    co2 = min(max(co2 + (par_delta * 200.0), 360.0), 700.0)

    return temperature, rainfall, co2


def compute_temperature_penalty(temperature: float, threshold: float = 30.0) -> float:
    # Heat penalty increases faster once temperature crosses 30C.
    excess = max(0.0, temperature - threshold)
    return excess * 0.22


def compute_rainfall_benefit(rainfall: float, optimal: float = 220.0) -> float:
    # Benefit peaks near optimal rainfall and declines as conditions move away.
    distance = abs(rainfall - optimal)
    return max(0.0, 1.5 - (distance / 120.0))


def compute_co2_benefit(co2: float, baseline: float = 400.0) -> float:
    # Small positive CO2 fertilization effect around baseline.
    return max(0.0, (co2 - baseline) * 0.004)


def compute_confidence(temperature: float, rainfall: float, optimal_rainfall: float = 220.0) -> float:
    # Confidence drops when climate stress is farther from moderate/optimal conditions.
    temp_risk = max(0.0, temperature - 30.0) / 15.0
    rain_risk = abs(rainfall - optimal_rainfall) / 220.0
    confidence = 0.95 - (0.12 * temp_risk) - (0.10 * rain_risk)
    return float(min(max(confidence, 0.7), 0.95))


def run_prediction(region: str, scenario: str, genotypes: list, soil: str | None = None):
    # Deterministic baseline climate by scenario + soil adjustments.
    baseline_temperature, baseline_rainfall, co2 = get_climate_factors(scenario, soil)

    # Real-time weather fetch with built-in fallback in weather service.
    weather = get_weather(region)

    # Replace static temperature with API-backed temperature when available.
    api_temperature = weather.get("temperature_c")
    if isinstance(api_temperature, (int, float)):
        temperature = float(api_temperature)
    else:
        temperature = baseline_temperature

    # Use rainfall from API if provided; otherwise keep deterministic baseline fallback.
    api_rainfall_mm = weather.get("rainfall_mm")
    if isinstance(api_rainfall_mm, (int, float)):
        rainfall = min(max(80.0 + (float(api_rainfall_mm) * 18.0), 80.0), 400.0)
    else:
        rainfall = baseline_rainfall

    logger.info(
        "Prediction weather inputs region=%s source=%s temp=%.1fC rainfall=%.1fmm co2=%.1f humidity=%s condition=%s",
        region,
        weather.get("source"),
        temperature,
        rainfall,
        co2,
        weather.get("humidity"),
        weather.get("condition"),
    )

    predictions = []

    for genotype in genotypes:
        genetic_vector = generate_deterministic_snp_features(genotype)

        # Base yield level for the crop system.
        base_yield = 4.0

        # Genetic factor: weighted SNP score from the leading loci.
        genetic_score = compute_genetic_score(genetic_vector)

        # Temperature factor: subtract penalty above threshold.
        temperature_penalty = compute_temperature_penalty(temperature)

        # Rainfall factor: positive benefit around optimal rainfall range.
        rainfall_benefit = compute_rainfall_benefit(rainfall)

        # CO2 factor: small positive contribution.
        co2_benefit = compute_co2_benefit(co2)

        final_yield = base_yield + genetic_score - temperature_penalty + rainfall_benefit + co2_benefit
        final_yield = min(max(final_yield, 1.2), 12.5)

        confidence = compute_confidence(temperature=temperature, rainfall=rainfall)

        predictions.append({
            "id": genotype,
            "yield_estimate": round(float(final_yield), 2),
            "confidence": round(confidence, 2),
        })

    return predictions
