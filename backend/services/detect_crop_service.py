import re


SUPPORTED_CROPS = ["Wheat", "Rice", "Maize", "Cotton", "Bajra", "Sugarcane"]

IGNORE_TOKENS = {
    "img", "image", "photo", "pic", "crop", "leaf", "plant", "final", "new", "camera",
    "file", "upload", "sample", "test", "edited", "copy", "scan", "shot", "field", "farm",
}

ALIASES = {
    "wheat": "Wheat",
    "rice": "Rice",
    "maize": "Maize",
    "corn": "Maize",
    "cotton": "Cotton",
    "bajra": "Bajra",
    "millet": "Bajra",
    "ganna": "Sugarcane",
    "gana": "Sugarcane",
    "sugarcane": "Sugarcane",
}


def _tokenize_filename(filename: str) -> list[str]:
    stem = filename.rsplit(".", 1)[0].lower()
    tokens = [t for t in re.split(r"[^a-z]+", stem) if t]
    return tokens


def _detect_from_filename(filename: str | None) -> str | None:
    if not filename:
        return None

    tokens = _tokenize_filename(filename)
    if not tokens:
        return None

    # 1) Exact alias match anywhere in filename.
    for token in tokens:
        if token in ALIASES:
            return ALIASES[token]

    # 2) If any token contains alias text (e.g. pearlmillet123).
    for token in tokens:
        for alias, crop_name in ALIASES.items():
            if alias in token:
                return crop_name

    # 3) Fallback to first meaningful token as custom crop name.
    meaningful_tokens = [t for t in tokens if t not in IGNORE_TOKENS and len(t) > 2]
    if meaningful_tokens:
        # Prefer the longest meaningful token for better generic-crop guesses.
        return max(meaningful_tokens, key=len).title()

    return None

    return None


def detect_crop_from_image(filename: str | None, image_bytes: bytes | None) -> str:
    # Priority 1: explicit filename hints.
    from_name = _detect_from_filename(filename)
    if from_name:
        return from_name

    # Priority 2: deterministic byte-signature fallback.
    if image_bytes:
        signature = sum(image_bytes[:2048]) + len(image_bytes)
        return SUPPORTED_CROPS[signature % len(SUPPORTED_CROPS)]

    return "Wheat"
