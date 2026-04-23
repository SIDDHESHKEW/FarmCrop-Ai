from html import escape
import logging
import os
import shutil

import pdfkit


logger = logging.getLogger(__name__)


def _safe_text(value: object, max_len: int) -> str:
    raw = str(value if value is not None else "")
    compact = " ".join(raw.split())
    return escape(compact[:max_len])


def _format_impact(value: object) -> str:
    try:
        numeric = float(value)
    except (TypeError, ValueError):
        return "+0.00"
    return f"{numeric:+.2f}"


def generate_html(data: dict) -> str:
    region = _safe_text(data.get("region", "N/A"), 48)
    scenario = _safe_text(data.get("scenario", "N/A"), 56)
    crop = _safe_text(data.get("crop", "N/A"), 30)
    genotype_id = _safe_text(data.get("genotype_id", "N/A"), 40)

    yield_value = data.get("yield", data.get("yield_value", "N/A"))
    confidence = data.get("confidence", "N/A")
    prediction_values = data.get("prediction_values", {})
    predicted_yield = prediction_values.get("yield", yield_value)
    predicted_confidence = prediction_values.get("confidence", confidence)

    temperature = _safe_text(data.get("temperature", data.get("temp", "N/A")), 20)
    rainfall = _safe_text(data.get("rainfall", data.get("rain", "N/A")), 20)
    co2 = _safe_text(data.get("co2", "N/A"), 20)

    recommendation = _safe_text(
        data.get(
            "recommendation",
            "Adopt resilient crop management and stress-tolerant selections for projected climate conditions.",
        ),
        280,
    )
    audit_hash = _safe_text(data.get("hash", "N/A"), 64)

    features = list(data.get("features", []))[:3]
    while len(features) < 3:
        features.append({"name": "N/A", "impact": 0})

    feature_rows = []
    for feature in features:
        name = _safe_text(feature.get("name", "N/A"), 56)
        impact = escape(_format_impact(feature.get("impact", 0)))
        feature_rows.append(
            "<tr>"
            '<td style="padding:6px 0; font-size:12px; color:#ffffff; width:16px; vertical-align:top;">&#8250;</td>'
            f'<td style="padding:6px 0; font-size:12px; color:#ffffff; vertical-align:top;">{name}</td>'
            f'<td style="padding:6px 0; font-size:12px; color:#22c55e; text-align:right; vertical-align:top;">{impact}</td>'
            "</tr>"
        )

    confidence_pct = f"{float(confidence) * 100:.1f}%" if isinstance(confidence, (float, int)) else _safe_text(confidence, 20)
    predicted_yield_label = f"{float(predicted_yield):.2f} t/ha" if isinstance(predicted_yield, (float, int)) else _safe_text(predicted_yield, 24)
    predicted_confidence_pct = (
        f"{float(predicted_confidence) * 100:.1f}%"
        if isinstance(predicted_confidence, (float, int))
        else _safe_text(predicted_confidence, 20)
    )
    if isinstance(yield_value, (int, float)):
        yield_label = f"{yield_value:.2f} t/ha"
    else:
        yield_label = _safe_text(yield_value, 24)

    return f"""<!DOCTYPE html>
<html>
<head>
<meta charset=\"UTF-8\">
<title>Breeding Blueprint Report</title>
</head>
<body style=\"margin:0; padding:0; background:#0f172a; font-family:Arial,sans-serif;\">

<div style=\"width:800px; height:1000px; margin:0 auto; padding:54px 48px; box-sizing:border-box; background:#0f172a; overflow:hidden;\">
  <div style=\"text-align:center; margin-bottom:0;\">
    <p style=\"margin:0; font-size:12px; color:#22c55e; letter-spacing:4px; text-transform:uppercase; font-weight:700;\">FarmerCrop AI</p>
    <p style=\"margin:10px 0 0 0; font-size:26px; color:#ffffff; font-weight:800; letter-spacing:1px;\">Breeding Blueprint Report</p>
    <div style=\"width:50px; height:3px; background:#22c55e; margin:14px auto 0 auto;\"></div>
  </div>

  <div style=\"height:80px;\"></div>

  <table width=\"560\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse; background:#111827; border:1px solid #1e293b;\">
    <tr>
      <td style=\"padding:58px 48px; text-align:center;\">
        <p style=\"margin:0 0 8px 0; font-size:11px; color:#94a3b8; letter-spacing:4px; text-transform:uppercase;\">Recommended Crop</p>
        <p style=\"margin:0 0 34px 0; font-size:38px; color:#ffffff; font-weight:900; letter-spacing:2px;\">{crop}</p>
        <p style=\"margin:0 0 8px 0; font-size:11px; color:#94a3b8; letter-spacing:4px; text-transform:uppercase;\">Yield Projection</p>
        <p style=\"margin:0 0 34px 0; font-size:34px; color:#22c55e; font-weight:800;\">{yield_label}</p>
        <p style=\"margin:0 0 8px 0; font-size:11px; color:#94a3b8; letter-spacing:4px; text-transform:uppercase;\">Confidence</p>
        <p style=\"margin:0; font-size:18px; color:#ffffff; font-weight:600;\">{confidence_pct}</p>
      </td>
    </tr>
  </table>

  <div style=\"height:70px;\"></div>

  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse; border-top:1px solid #1e293b;\">
    <tr>
      <td style=\"padding-top:18px; font-size:12px; color:#64748b; text-align:left;\">Region: {region}</td>
      <td style=\"padding-top:18px; font-size:12px; color:#64748b; text-align:right;\">Scenario: {scenario}</td>
    </tr>
  </table>
</div>

<div style=\"page-break-before: always;\"></div>

<div style=\"width:800px; height:1000px; margin:0 auto; padding:40px 48px; box-sizing:border-box; background:#0f172a; overflow:hidden;\">
  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse; border-bottom:1px solid #1e293b; margin-bottom:20px;\">
    <tr>
      <td style=\"padding-bottom:12px; font-size:11px; color:#22c55e; letter-spacing:3px; text-transform:uppercase; font-weight:700;\">FarmerCrop AI</td>
      <td style=\"padding-bottom:12px; font-size:11px; color:#64748b; text-align:right;\">Technical Detail Sheet</td>
    </tr>
  </table>

  <p style=\"margin:0 0 8px 0; font-size:10px; color:#22c55e; letter-spacing:3px; text-transform:uppercase; font-weight:700;\">Input Details</p>
  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse; background:#111827; border:1px solid #1e293b; margin-bottom:16px;\">
    <tr>
      <td style=\"padding:9px 14px; font-size:12px; color:#64748b; width:140px; border-bottom:1px solid #1e293b;\">Region</td>
      <td style=\"padding:9px 14px; font-size:12px; color:#ffffff; border-bottom:1px solid #1e293b;\">{region}</td>
    </tr>
    <tr>
      <td style=\"padding:9px 14px; font-size:12px; color:#64748b; border-bottom:1px solid #1e293b;\">Scenario</td>
      <td style=\"padding:9px 14px; font-size:12px; color:#ffffff; border-bottom:1px solid #1e293b;\">{scenario}</td>
    </tr>
    <tr>
      <td style=\"padding:9px 14px; font-size:12px; color:#64748b; border-bottom:1px solid #1e293b;\">Genotype ID</td>
      <td style=\"padding:9px 14px; font-size:12px; color:#ffffff; border-bottom:1px solid #1e293b;\">{genotype_id}</td>
    </tr>
    <tr>
      <td style=\"padding:9px 14px; font-size:12px; color:#64748b;\">Crop</td>
      <td style=\"padding:9px 14px; font-size:12px; color:#22c55e; font-weight:700;\">{crop}</td>
    </tr>
  </table>

  <p style=\"margin:0 0 8px 0; font-size:10px; color:#22c55e; letter-spacing:3px; text-transform:uppercase; font-weight:700;\">Prediction Values</p>
  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse; background:#111827; border:1px solid #1e293b; margin-bottom:16px;\">
    <tr>
      <td style=\"padding:9px 14px; font-size:12px; color:#64748b; width:140px; border-bottom:1px solid #1e293b;\">Predicted Yield</td>
      <td style=\"padding:9px 14px; font-size:12px; color:#ffffff; border-bottom:1px solid #1e293b;\">{predicted_yield_label}</td>
    </tr>
    <tr>
      <td style=\"padding:9px 14px; font-size:12px; color:#64748b;\">Predicted Confidence</td>
      <td style=\"padding:9px 14px; font-size:12px; color:#ffffff;\">{predicted_confidence_pct}</td>
    </tr>
  </table>

  <p style=\"margin:0 0 8px 0; font-size:10px; color:#22c55e; letter-spacing:3px; text-transform:uppercase; font-weight:700;\">Climate Parameters</p>
  <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse; background:#111827; border:1px solid #1e293b; margin-bottom:16px;\">
    <tr>
      <td style=\"padding:9px 14px; font-size:12px; color:#64748b; width:140px; border-bottom:1px solid #1e293b;\">Temperature</td>
      <td style=\"padding:9px 14px; font-size:12px; color:#ffffff; border-bottom:1px solid #1e293b;\">{temperature}</td>
    </tr>
    <tr>
      <td style=\"padding:9px 14px; font-size:12px; color:#64748b; border-bottom:1px solid #1e293b;\">Rainfall</td>
      <td style=\"padding:9px 14px; font-size:12px; color:#ffffff; border-bottom:1px solid #1e293b;\">{rainfall}</td>
    </tr>
    <tr>
      <td style=\"padding:9px 14px; font-size:12px; color:#64748b;\">CO2 Level</td>
      <td style=\"padding:9px 14px; font-size:12px; color:#ffffff;\">{co2}</td>
    </tr>
  </table>

  <p style=\"margin:0 0 8px 0; font-size:10px; color:#22c55e; letter-spacing:3px; text-transform:uppercase; font-weight:700;\">AI Feature Insights</p>
  <div style=\"background:#111827; border:1px solid #1e293b; padding:12px 14px; margin-bottom:16px;\">
    <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse;\">
      {''.join(feature_rows)}
    </table>
  </div>

  <p style=\"margin:0 0 8px 0; font-size:10px; color:#22c55e; letter-spacing:3px; text-transform:uppercase; font-weight:700;\">Recommendation</p>
  <div style=\"background:#111827; border:1px solid #1e293b; padding:12px 14px; margin-bottom:16px;\">
    <p style=\"margin:0; font-size:12px; color:#cbd5e1; line-height:1.6;\">{recommendation}</p>
  </div>

  <div style=\"background:#0a0f1e; border:1px solid #22c55e; padding:14px 18px;\">
    <table width=\"100%\" cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse;\">
      <tr>
        <td>
          <p style=\"margin:0 0 4px 0; font-size:12px; color:#22c55e; font-weight:700;\">&#10004; VERIFIED &amp; SIGNED</p>
          <p style=\"margin:0 0 2px 0; font-size:11px; color:#94a3b8;\">FarmerCrop AI Engine v2.4</p>
          <p style=\"margin:0; font-size:10px; color:#475569; font-family:Courier,monospace;\">Audit Hash: {audit_hash}</p>
        </td>
        <td style=\"text-align:right; vertical-align:middle;\">
          <p style=\"margin:0; font-size:10px; color:#475569;\">Page 2 of 2</p>
        </td>
      </tr>
    </table>
  </div>
</div>

</body>
</html>"""


def generate_blueprint_pdf(data: dict) -> bytes:
    logger.info(
        "Generating PDF with crop=%s region=%s scenario=%s genotype_id=%s yield=%s confidence=%s",
        data.get("crop"),
        data.get("region"),
        data.get("scenario"),
        data.get("genotype_id"),
        data.get("yield"),
        data.get("confidence"),
    )

    html = generate_html(data)
    options = {
        "page-size": "A4",
        "margin-top": "0mm",
        "margin-right": "0mm",
        "margin-bottom": "0mm",
        "margin-left": "0mm",
        "encoding": "UTF-8",
        "no-outline": None,
        "disable-smart-shrinking": "",
        "print-media-type": "",
        "dpi": "96",
        "zoom": "1",
        "quiet": "",
    }

    wkhtmltopdf_path = os.getenv("WKHTMLTOPDF_PATH") or shutil.which("wkhtmltopdf")
    if not wkhtmltopdf_path and os.name == "nt":
        fallback_paths = [
            r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe",
            r"C:\Program Files (x86)\wkhtmltopdf\bin\wkhtmltopdf.exe",
        ]
        for candidate in fallback_paths:
            if os.path.isfile(candidate):
                wkhtmltopdf_path = candidate
                break

    if wkhtmltopdf_path:
        config = pdfkit.configuration(wkhtmltopdf=wkhtmltopdf_path)
        return pdfkit.from_string(html, False, options=options, configuration=config)
    return pdfkit.from_string(html, False, options=options)
