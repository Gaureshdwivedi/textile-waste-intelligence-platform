import json
from pathlib import Path

import numpy as np
import tensorflow as tf
from tensorflow.keras.utils import load_img, img_to_array

from ai.config import (
    MODELS_DIR,
    LABELS_PATH,
    IMAGE_SIZE,
    FABRIC_INFO_PATH,
)


# ==========================================================
# MODEL PATH
# ==========================================================

MODEL_PATH = (
    Path(MODELS_DIR)
    / "textile_model_v4_best.keras"
)


# ==========================================================
# LOAD MODEL
# ==========================================================

print("\nLoading Textile AI V4 model...")
print(f"Model: {MODEL_PATH}")

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"V4 model not found:\n{MODEL_PATH}"
    )

model = tf.keras.models.load_model(
    MODEL_PATH
)

print("Textile AI V4 model loaded successfully!")


# ==========================================================
# LOAD CLASS LABELS
# ==========================================================

with open(LABELS_PATH, "r") as f:
    CLASS_NAMES = json.load(f)


# ==========================================================
# LOAD FABRIC INFORMATION
# ==========================================================

if Path(FABRIC_INFO_PATH).exists():

    with open(FABRIC_INFO_PATH, "r") as f:
        FABRIC_INFO = json.load(f)

else:

    FABRIC_INFO = {}


# ==========================================================
# PREDICT IMAGE
# ==========================================================

def predict_image(image_path):

    # ------------------------------------------------------
    # Load Image
    # ------------------------------------------------------

    image = load_img(
        image_path,
        target_size=IMAGE_SIZE,
    )

    image_array = img_to_array(
        image
    )

    image_array = np.expand_dims(
        image_array,
        axis=0,
    )


    # ------------------------------------------------------
    # Prediction
    # ------------------------------------------------------

    predictions = model.predict(
        image_array,
        verbose=0,
    )[0]


    # ------------------------------------------------------
    # Top 3 Predictions
    # ------------------------------------------------------

    top_indices = np.argsort(
        predictions
    )[-3:][::-1]


    top_predictions = []


    for index in top_indices:

        fabric = CLASS_NAMES[
            int(index)
        ]

        confidence = float(
            predictions[index] * 100
        )

        top_predictions.append(
            {
                "fabric": fabric,
                "confidence": round(
                    confidence,
                    2,
                ),
            }
        )


    # ------------------------------------------------------
    # Primary Prediction
    # ------------------------------------------------------

    primary = top_predictions[0]

    fabric = primary["fabric"]

    confidence = primary["confidence"]


    # ------------------------------------------------------
    # Fabric Information
    # ------------------------------------------------------

    fabric_data = FABRIC_INFO.get(
        fabric,
        {}
    )


    category = fabric_data.get(
        "category",
        "Unknown",
    )


    recyclability = fabric_data.get(
        "recyclability",
        "Unknown",
    )


    recommendation = fabric_data.get(
        "recommendation",
        "No recommendation available.",
    )


    # ------------------------------------------------------
    # Final Result
    # ------------------------------------------------------

    result = {

        "fabric": fabric,

        "confidence": confidence,

        "alternatives": top_predictions[1:],

        "top_predictions": top_predictions,

        "category": category,

        "recyclability": recyclability,

        "recommendation": recommendation,
    }


    print(
        "\nAI Prediction:",
        result
    )


    return result