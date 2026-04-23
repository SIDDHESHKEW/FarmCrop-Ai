from typing import Dict, List

from pydantic import BaseModel, Field


class FeatureItem(BaseModel):
    name: str
    impact: float


class GeneratePdfRequest(BaseModel):
    region: str
    scenario: str
    crop: str
    genotype_id: str | None = None
    yield_value: float = Field(alias="yield")
    confidence: float
    temperature: str
    rainfall: str
    co2: str
    prediction_values: Dict[str, float] | None = None
    features: List[FeatureItem]
    hash: str
