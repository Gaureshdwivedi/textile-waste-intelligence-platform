import tensorflow as tf

from tensorflow.keras import Model

from tensorflow.keras.layers import (
    Dense,
    Dropout,
    GlobalAveragePooling2D,
    RandomFlip,
    RandomRotation,
    RandomZoom,
    RandomContrast,
)

from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.optimizers import Adam

from ai.config import (
    IMAGE_SIZE,
    LEARNING_RATE,
)


def build_model(num_classes):

    # ======================================================
    # Data Augmentation
    # ======================================================

    augmentation = tf.keras.Sequential([
        RandomFlip("horizontal"),
        RandomRotation(0.15),
        RandomZoom(0.20),
        RandomContrast(0.15),
    ], name="data_augmentation")

    # ======================================================
    # MobileNetV2 Base Model
    # ======================================================

    base_model = MobileNetV2(
        input_shape=IMAGE_SIZE + (3,),
        include_top=False,
        weights="imagenet",
    )

    # Freeze pretrained backbone
    base_model.trainable = False

    # ======================================================
    # Input
    # ======================================================

    inputs = tf.keras.Input(
        shape=IMAGE_SIZE + (3,),
        name="image_input",
    )

    # ======================================================
    # Augmentation
    # ======================================================

    x = augmentation(inputs)

    # ======================================================
    # MobileNetV2 Preprocessing
    # ======================================================

    x = tf.keras.applications.mobilenet_v2.preprocess_input(x)

    # ======================================================
    # Feature Extraction
    # ======================================================

    x = base_model(
        x,
        training=False,
    )

    # ======================================================
    # Classification Head
    # ======================================================

    x = GlobalAveragePooling2D()(x)

    x = Dropout(
        0.35,
        name="dropout_1",
    )(x)

    x = Dense(
        256,
        activation="relu",
        name="classification_dense",
    )(x)

    x = Dropout(
        0.25,
        name="dropout_2",
    )(x)

    outputs = Dense(
        num_classes,
        activation="softmax",
        name="predictions",
    )(x)

    # ======================================================
    # Create Model
    # ======================================================

    model = Model(
        inputs=inputs,
        outputs=outputs,
        name="Textile_MobileNetV2_V3",
    )

    # ======================================================
    # Compile
    # ======================================================

    model.compile(
        optimizer=Adam(
            learning_rate=LEARNING_RATE,
        ),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )

    return model