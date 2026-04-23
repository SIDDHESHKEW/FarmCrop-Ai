import logging
import os
from typing import Any

import requests


logger = logging.getLogger(__name__)

OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"


def _fallback_weather(region_name: str, reason: str) -> dict[str, Any]:
	"""Return safe, location-aware defaults when API is unavailable."""
	region = (region_name or "Unknown").strip()
	region_key = region.lower()

	presets = {
		"punjab": (31.0, 52, "Haze"),
		"nagpur": (33.0, 42, "Clear"),
		"iowa": (18.0, 60, "Clouds"),
		"mekong": (29.0, 78, "Rain"),
		"nile": (30.0, 35, "Clear"),
	}

	temperature_c, humidity, condition = (28.0, 55, "Unknown")
	for key, values in presets.items():
		if key in region_key:
			temperature_c, humidity, condition = values
			break

	return {
		"region": region,
		"temperature_c": round(float(temperature_c), 1),
		"rainfall_mm": None,
		"humidity": int(humidity),
		"condition": condition,
		"source": "fallback",
		"error": reason,
	}


def get_weather(region_name: str) -> dict[str, Any]:
	"""Fetch current weather from OpenWeather and return normalized fields.

	Output fields:
	- temperature_c
	- humidity
	- condition
	"""
	region = (region_name or "").strip()
	if not region:
		logger.warning("get_weather called with empty region_name")
		return _fallback_weather("Unknown", "Empty region name")

	api_key = os.getenv("OPENWEATHER_API_KEY")
	if not api_key:
		logger.error("OPENWEATHER_API_KEY is not set; using fallback weather")
		return _fallback_weather(region, "Missing OPENWEATHER_API_KEY")

	params = {
		"q": region,
		"appid": api_key,
		"units": "metric",
	}

	try:
		logger.info("Fetching OpenWeather data for region=%s", region)
		response = requests.get(OPENWEATHER_URL, params=params, timeout=8)
		response.raise_for_status()
		payload = response.json()

		main = payload.get("main", {})
		rain = payload.get("rain", {})
		weather_arr = payload.get("weather", [])
		weather_item = weather_arr[0] if weather_arr else {}

		temperature_c = main.get("temp")
		rainfall_mm = rain.get("1h")
		if rainfall_mm is None:
			rainfall_mm = rain.get("3h")
		humidity = main.get("humidity")
		condition = weather_item.get("main", "Unknown")

		if temperature_c is None or humidity is None:
			logger.error("OpenWeather payload missing expected fields: %s", payload)
			return _fallback_weather(region, "Incomplete OpenWeather response")

		return {
			"region": region,
			"temperature_c": round(float(temperature_c), 1),
			"rainfall_mm": float(rainfall_mm) if rainfall_mm is not None else None,
			"humidity": int(humidity),
			"condition": str(condition),
			"source": "openweather",
			"error": None,
		}
	except requests.RequestException as exc:
		logger.exception("OpenWeather request failed for region=%s", region)
		return _fallback_weather(region, f"OpenWeather request failed: {exc}")
	except (TypeError, ValueError, KeyError) as exc:
		logger.exception("Failed to parse OpenWeather payload for region=%s", region)
		return _fallback_weather(region, f"OpenWeather parsing failed: {exc}")
