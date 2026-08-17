from pathlib import Path

# ==========================================================
# Project Paths
# ==========================================================

PROJECT_ROOT = Path(__file__).resolve().parents[2]

DATASET_PATH = PROJECT_ROOT / "datasets"

MODELS_DIR = PROJECT_ROOT / "backend" / "ai" / "models"

GRAPHS_DIR = PROJECT_ROOT / "backend" / "ai" / "graphs"

LOGS_DIR = PROJECT_ROOT / "backend" / "ai" / "logs"

LABELS_PATH = PROJECT_ROOT / "backend" / "ai" / "labels.json"

FABRIC_INFO_PATH = PROJECT_ROOT / "backend" / "ai" / "fabric_info.json"

# ==========================================================
# Training Parameters
# ==========================================================

IMAGE_SIZE = (224, 224)

BATCH_SIZE = 32

EPOCHS = 20

LEARNING_RATE = 0.0001

VALIDATION_SPLIT = 0.20

SEED = 42

# ==========================================================
# Selected Classes
# ==========================================================

CLASSES = [
    "Corduroy",
    "Cotton",
    "Denim",
    "Fleece",
    "Leather",
    "Linen",
    "Nylon",
    "Polyester",
    "Silk",
    "Velvet",
]