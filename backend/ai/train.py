import os
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf

from sklearn.metrics import (
    classification_report,
    confusion_matrix,
)

from tensorflow.keras.callbacks import (
    EarlyStopping,
    ModelCheckpoint,
    ReduceLROnPlateau,
)

from ai.dataset import load_dataset
from ai.model import build_model

from ai.config import (
    MODELS_DIR,
    GRAPHS_DIR,
    EPOCHS,
)


# ==========================================================
# Folders
# ==========================================================

os.makedirs(
    MODELS_DIR,
    exist_ok=True,
)

os.makedirs(
    GRAPHS_DIR,
    exist_ok=True,
)


# ==========================================================
# V3 Configuration
# ==========================================================

V3_EPOCHS = EPOCHS

MODEL_V3_PATH = os.path.join(
    MODELS_DIR,
    "textile_model_v3.keras",
)

BEST_MODEL_V3_PATH = os.path.join(
    MODELS_DIR,
    "textile_model_v3_best.keras",
)


# ==========================================================
# Load Dataset
# ==========================================================

print("\n" + "=" * 70)
print("TEXTILE AI MODEL V3")
print("=" * 70)

print("\nLoading dataset...")

train_ds, val_ds, class_names = load_dataset()

print("\nClasses:")

for index, name in enumerate(class_names):
    print(
        f"{index}: {name}"
    )

print(
    f"\nTraining batches   : {len(train_ds)}"
)

print(
    f"Validation batches : {len(val_ds)}"
)


# ==========================================================
# Calculate Class Counts
# ==========================================================

print("\n" + "=" * 70)
print("CALCULATING MODERATE CLASS WEIGHTS")
print("=" * 70)

class_counts = np.zeros(
    len(class_names),
    dtype=np.int64,
)


for _, labels in train_ds:

    labels_numpy = labels.numpy()

    for label in labels_numpy:

        class_counts[
            int(label)
        ] += 1


print("\nTraining samples per class:")

for index, name in enumerate(class_names):

    print(
        f"{name:<15} : "
        f"{class_counts[index]}"
    )


# ==========================================================
# Moderate Class Weighting
# ==========================================================

max_count = np.max(
    class_counts
)

class_weights = {}

for index, count in enumerate(
    class_counts
):

    if count > 0:

        # Square-root weighting.
        #
        # This reduces the dominance of
        # large classes without giving
        # extremely large weights to
        # very small classes.

        weight = np.sqrt(
            max_count / count
        )

        class_weights[index] = float(
            weight
        )

    else:

        class_weights[index] = 1.0


print("\nModerate class weights:")

for index, name in enumerate(
    class_names
):

    print(
        f"{name:<15} : "
        f"{class_weights[index]:.4f}"
    )


# ==========================================================
# Build Model
# ==========================================================

print("\n" + "=" * 70)
print("BUILDING MOBILE-NET V2 V3 MODEL")
print("=" * 70)

model = build_model(
    num_classes=len(class_names)
)

model.summary()


# ==========================================================
# Callbacks
# ==========================================================

callbacks = [

    EarlyStopping(
        monitor="val_accuracy",
        patience=5,
        restore_best_weights=True,
        verbose=1,
    ),

    ModelCheckpoint(
        filepath=BEST_MODEL_V3_PATH,
        monitor="val_accuracy",
        save_best_only=True,
        verbose=1,
    ),

    ReduceLROnPlateau(
        monitor="val_loss",
        factor=0.2,
        patience=2,
        min_lr=1e-7,
        verbose=1,
    ),
]


# ==========================================================
# Training
# ==========================================================

print("\n" + "=" * 70)
print("V3 TRAINING STARTED")
print("=" * 70)

history = model.fit(

    train_ds,

    validation_data=val_ds,

    epochs=V3_EPOCHS,


    callbacks=callbacks,
)


# ==========================================================
# Save Model
# ==========================================================

model.save(
    MODEL_V3_PATH
)

print(
    f"\nModel saved to:"
)

print(
    MODEL_V3_PATH
)


print(
    "\nBest model saved to:"
)

print(
    BEST_MODEL_V3_PATH
)


# ==========================================================
# Accuracy Graph
# ==========================================================

plt.figure(
    figsize=(10, 6)
)

plt.plot(
    history.history["accuracy"],
    label="Training Accuracy",
)

plt.plot(
    history.history["val_accuracy"],
    label="Validation Accuracy",
)

plt.title(
    "Textile AI V3 — Accuracy"
)

plt.xlabel(
    "Epoch"
)

plt.ylabel(
    "Accuracy"
)

plt.legend()

plt.grid(True)

plt.tight_layout()

plt.savefig(
    os.path.join(
        GRAPHS_DIR,
        "accuracy_v3.png",
    )
)

plt.close()


# ==========================================================
# Loss Graph
# ==========================================================

plt.figure(
    figsize=(10, 6)
)

plt.plot(
    history.history["loss"],
    label="Training Loss",
)

plt.plot(
    history.history["val_loss"],
    label="Validation Loss",
)

plt.title(
    "Textile AI V3 — Loss"
)

plt.xlabel(
    "Epoch"
)

plt.ylabel(
    "Loss"
)

plt.legend()

plt.grid(True)

plt.tight_layout()

plt.savefig(
    os.path.join(
        GRAPHS_DIR,
        "loss_v3.png",
    )
)

plt.close()


# ==========================================================
# Evaluation
# ==========================================================

print("\n" + "=" * 70)
print("FINAL V3 EVALUATION")
print("=" * 70)

loss, accuracy = model.evaluate(
    val_ds,
    verbose=1,
)

print(
    f"\nValidation Accuracy : "
    f"{accuracy * 100:.2f}%"
)

print(
    f"Validation Loss     : "
    f"{loss:.4f}"
)


# ==========================================================
# Generate Predictions
# ==========================================================

print(
    "\nGenerating predictions..."
)

y_true = []
y_pred = []


for images, labels in val_ds:

    predictions = model.predict(
        images,
        verbose=0,
    )

    predicted_classes = np.argmax(
        predictions,
        axis=1,
    )

    y_true.extend(
        labels.numpy()
    )

    y_pred.extend(
        predicted_classes
    )


y_true = np.array(
    y_true
)

y_pred = np.array(
    y_pred
)


# ==========================================================
# Classification Report
# ==========================================================

print(
    "\n" + "=" * 70
)

print(
    "CLASSIFICATION REPORT"
)

print(
    "=" * 70
)

print(
    classification_report(
        y_true,
        y_pred,
        target_names=class_names,
        zero_division=0,
    )
)


# ==========================================================
# Confusion Matrix
# ==========================================================

cm = confusion_matrix(
    y_true,
    y_pred,
)


plt.figure(
    figsize=(10, 8)
)

plt.imshow(
    cm,
    interpolation="nearest",
)

plt.title(
    "Textile Fabric Classification — V3"
)

plt.colorbar()

tick_marks = np.arange(
    len(class_names)
)

plt.xticks(
    tick_marks,
    class_names,
    rotation=45,
    ha="right",
)

plt.yticks(
    tick_marks,
    class_names,
)

plt.xlabel(
    "Predicted Label"
)

plt.ylabel(
    "True Label"
)

plt.tight_layout()

plt.savefig(
    os.path.join(
        GRAPHS_DIR,
        "confusion_matrix_v3.png",
    )
)

plt.close()


# ==========================================================
# Complete
# ==========================================================

print(
    "\n" + "=" * 70
)

print(
    "AI MODEL V3 TRAINING COMPLETED"
)

print(
    "=" * 70
)

print(
    "\nGenerated files:"
)

print(
    MODEL_V3_PATH
)

print(
    BEST_MODEL_V3_PATH
)

print(
    os.path.join(
        GRAPHS_DIR,
        "accuracy_v3.png",
    )
)

print(
    os.path.join(
        GRAPHS_DIR,
        "loss_v3.png",
    )
)

print(
    os.path.join(
        GRAPHS_DIR,
        "confusion_matrix_v3.png",
    )
)