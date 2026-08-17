"""
TextileAI - Circular Economy Analytics

Milestone 3.4

Aggregates the user's textile analyses and produces:
- Total analyses
- Fabric distribution
- Recyclability distribution
- Recovery potential distribution
- Average AI confidence
- Average sustainability score
- Average circularity score
- Environmental impact totals
- Recommended recovery methods
"""

from collections import Counter
import json


# ==========================================================
# Helper: Safe Float
# ==========================================================

def safe_float(value, default=0.0):

    try:
        if value is None:
            return default

        return float(value)

    except (TypeError, ValueError):

        return default


# ==========================================================
# Helper: Normalize Text
# ==========================================================

def normalize_text(value):

    if not value:
        return "Unknown"

    return str(value).strip()


# ==========================================================
# Main Analytics Function
# ==========================================================

def calculate_circular_economy_analytics(
    textiles,
):
    """
    Calculate circular economy analytics from
    the user's textile analysis history.

    Parameters
    ----------
    textiles:
        SQLAlchemy Textile objects.

    Returns
    -------
    dict
    """

    total_analyses = len(textiles)

    # ======================================================
    # Empty Dataset
    # ======================================================

    if total_analyses == 0:

        return {
            "total_analyses": 0,

            "average_confidence": 0,

            "average_sustainability_score": 0,

            "average_circularity_score": 0,

            "fabric_distribution": {},

            "recyclability_distribution": {},

            "recovery_distribution": {},

            "recommendation_distribution": {},

            "environmental_impact": {
                "estimated_co2_savings_kg": 0,
                "estimated_water_savings_liters": 0,
                "estimated_landfill_diversion_kg": 0,
                "estimated_resource_recovery_kg": 0,
            },

            "high_recovery_count": 0,

            "high_recyclability_count": 0,

            "most_detected_fabric": "None",

            "most_recommended_action": "None",
        }

    # ======================================================
    # Counters
    # ======================================================

    fabric_counter = Counter()

    recyclability_counter = Counter()

    recovery_counter = Counter()

    recommendation_counter = Counter()

    # ======================================================
    # Numeric Totals
    # ======================================================

    confidence_total = 0.0

    sustainability_total = 0.0

    circularity_total = 0.0

    sustainability_count = 0

    circularity_count = 0

    # ======================================================
    # Environmental Totals
    # ======================================================

    total_co2 = 0.0

    total_water = 0.0

    total_landfill = 0.0

    total_resource_recovery = 0.0

    # ======================================================
    # Recovery Counts
    # ======================================================

    high_recovery_count = 0

    high_recyclability_count = 0

    # ======================================================
    # Process Each Textile
    # ======================================================

    for textile in textiles:

        # --------------------------------------------------
        # Fabric
        # --------------------------------------------------

        fabric = normalize_text(
            getattr(
                textile,
                "prediction",
                None,
            )
        )

        fabric_counter[fabric] += 1

        # --------------------------------------------------
        # Recyclability
        # --------------------------------------------------

        recyclability = normalize_text(
            getattr(
                textile,
                "recyclable",
                None,
            )
        )

        recyclability_counter[
            recyclability
        ] += 1

        if recyclability.lower() == "high":

            high_recyclability_count += 1

        # --------------------------------------------------
        # Confidence
        # --------------------------------------------------

        confidence = safe_float(
            getattr(
                textile,
                "confidence",
                None,
            )
        )

        confidence_total += confidence

        # --------------------------------------------------
        # Sustainability Score
        # --------------------------------------------------

        sustainability_score = safe_float(
            getattr(
                textile,
                "sustainability_score",
                None,
            )
        )

        if sustainability_score > 0:

            sustainability_total += (
                sustainability_score
            )

            sustainability_count += 1

        # --------------------------------------------------
        # Circularity Score
        # --------------------------------------------------

        circularity_score = safe_float(
            getattr(
                textile,
                "circularity_score",
                None,
            )
        )

        if circularity_score > 0:

            circularity_total += (
                circularity_score
            )

            circularity_count += 1

        # --------------------------------------------------
        # Recovery Category
        # --------------------------------------------------

        recovery_category = normalize_text(
            getattr(
                textile,
                "recovery_category",
                None,
            )
        )

        recovery_counter[
            recovery_category
        ] += 1

        if recovery_category in {
            "Excellent Recovery Potential",
            "High Recovery Potential",
        }:

            high_recovery_count += 1

        # --------------------------------------------------
        # Recommendation
        # --------------------------------------------------

        recommendation = normalize_text(
            getattr(
                textile,
                "primary_action",
                None,
            )
        )

        recommendation_counter[
            recommendation
        ] += 1

        # --------------------------------------------------
        # Environmental Metrics
        # --------------------------------------------------

        total_co2 += safe_float(
            getattr(
                textile,
                "estimated_co2_savings_kg",
                None,
            )
        )

        total_water += safe_float(
            getattr(
                textile,
                "estimated_water_savings_liters",
                None,
            )
        )

        total_landfill += safe_float(
            getattr(
                textile,
                "estimated_landfill_diversion_kg",
                None,
            )
        )

        total_resource_recovery += safe_float(
            getattr(
                textile,
                "estimated_resource_recovery_kg",
                None,
            )
        )

    # ======================================================
    # Averages
    # ======================================================

    average_confidence = round(
        confidence_total / total_analyses,
        2,
    )

    average_sustainability = round(
        sustainability_total / sustainability_count,
        2,
    ) if sustainability_count else 0

    average_circularity = round(
        circularity_total / circularity_count,
        2,
    ) if circularity_count else 0

    # ======================================================
    # Most Common Values
    # ======================================================

    most_detected_fabric = (
        fabric_counter.most_common(1)[0][0]
        if fabric_counter
        else "None"
    )

    most_recommended_action = (
        recommendation_counter.most_common(1)[0][0]
        if recommendation_counter
        else "None"
    )

    # ======================================================
    # Final Result
    # ======================================================

    return {

        "total_analyses": total_analyses,

        "average_confidence": (
            average_confidence
        ),

        "average_sustainability_score": (
            average_sustainability
        ),

        "average_circularity_score": (
            average_circularity
        ),

        "most_detected_fabric": (
            most_detected_fabric
        ),

        "most_recommended_action": (
            most_recommended_action
        ),

        "high_recovery_count": (
            high_recovery_count
        ),

        "high_recyclability_count": (
            high_recyclability_count
        ),

        "fabric_distribution": dict(
            fabric_counter
        ),

        "recyclability_distribution": dict(
            recyclability_counter
        ),

        "recovery_distribution": dict(
            recovery_counter
        ),

        "recommendation_distribution": dict(
            recommendation_counter
        ),

        "environmental_impact": {

            "estimated_co2_savings_kg": round(
                total_co2,
                2,
            ),

            "estimated_water_savings_liters": round(
                total_water,
                2,
            ),

            "estimated_landfill_diversion_kg": round(
                total_landfill,
                2,
            ),

            "estimated_resource_recovery_kg": round(
                total_resource_recovery,
                2,
            ),
        },
    }