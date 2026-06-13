import tensorflow as tf
import numpy as np
from PIL import Image

import os

print("Current Directory:", os.getcwd())
print("Model Exists:", os.path.exists("potato_model.keras"))

if os.path.exists("potato_model.keras"):
    print("Model Size:", os.path.getsize("potato_model.keras"))

model = tf.keras.models.load_import os

print("Current Directory:", os.getcwd())
print("Model Exists:", os.path.exists("potato_model.keras"))

if os.path.exists("potato_model.keras"):
    print("Model Size:", os.path.getsize("potato_model.keras"))model("potato_model.keras")
classes=["Potato___Early_blight", "Potato___Late_blight", "Potato___healthy"]
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
    disease=classes[predicted_idx]
    return {
        "disease": disease,
        "confidence": round(confidence, 2),
        "description": DISEASE_INFO[disease]["description"],
        "treatment": DISEASE_INFO[disease]["treatment"]

    }

