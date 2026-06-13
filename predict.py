import tensorflow as tf
from tensorflow import keras
import numpy as np
from PIL import Image

IMAGE_SIZE = 256
N_CLASSES = 3

# Build architecture
resize_and_rescale = keras.Sequential([
    keras.layers.Resizing(IMAGE_SIZE, IMAGE_SIZE),
    keras.layers.Rescaling(1./255)
])

model = keras.Sequential([
    resize_and_rescale,

    keras.layers.Conv2D(32, (3,3), activation='relu'),
    keras.layers.MaxPooling2D((2,2)),

    keras.layers.Conv2D(64, (3,3), activation='relu'),
    keras.layers.MaxPooling2D((2,2)),

    keras.layers.Conv2D(64, (3,3), activation='relu'),
    keras.layers.MaxPooling2D((2,2)),

    keras.layers.Conv2D(64, (3,3), activation='relu'),
    keras.layers.MaxPooling2D((2,2)),

    keras.layers.Conv2D(64, (3,3), activation='relu'),
    keras.layers.MaxPooling2D((2,2)),

    keras.layers.Conv2D(64, (3,3), activation='relu'),
    keras.layers.MaxPooling2D((2,2)),

    keras.layers.Flatten(),

    keras.layers.Dense(64, activation='relu'),

    keras.layers.Dense(N_CLASSES, activation='softmax')
])

model.build((None, 256, 256, 3))

print("Architecture built")

model.load_weights("model.h5")

print("Weights loaded successfully!")

classes = [
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy"
]

DISEASE_INFO = {
    "Potato___Early_blight": {
        "description": "Fungal disease causing dark spots on leaves.",
        "treatment": "Apply fungicide and remove infected leaves."
    },
    "Potato___Late_blight": {
        "description": "Serious disease that spreads rapidly in wet conditions.",
        "treatment": "Apply fungicide immediately and isolate infected plants."
    },
    "Potato___healthy": {
        "description": "The potato leaf appears healthy.",
        "treatment": "No treatment required."
    }
}


def predict_image(image_path):
    img = Image.open(image_path).convert("RGB")
    img = img.resize((256, 256))

    img_array = np.array(img)
    img_array = np.expand_dims(img_array, axis=0)

    predictions = model.predict(img_array, verbose=0)

    predicted_idx = np.argmax(predictions[0])

    confidence = float(np.max(predictions[0]) * 100)

    disease = classes[predicted_idx]

    return {
        "disease": disease,
        "confidence": round(confidence, 2),
        "description": DISEASE_INFO[disease]["description"],
        "treatment": DISEASE_INFO[disease]["treatment"]
    }