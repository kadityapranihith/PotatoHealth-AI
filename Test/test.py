import tensorflow as tf
from tensorflow import keras

IMAGE_SIZE = 256
CHANNELS = 3
N_CLASSES = 3

resize_and_rescale = keras.Sequential([
    keras.layers.Resizing(IMAGE_SIZE, IMAGE_SIZE),
    keras.layers.Rescaling(1./255)
])

model = keras.Sequential([
    resize_and_rescale,

    keras.layers.Conv2D(
        32,
        kernel_size=(3,3),
        activation='relu'
    ),
    keras.layers.MaxPooling2D((2,2)),

    keras.layers.Conv2D(
        64,
        (3,3),
        activation='relu'
    ),
    keras.layers.MaxPooling2D((2,2)),

    keras.layers.Conv2D(
        64,
        (3,3),
        activation='relu'
    ),
    keras.layers.MaxPooling2D((2,2)),

    keras.layers.Conv2D(
        64,
        (3,3),
        activation='relu'
    ),
    keras.layers.MaxPooling2D((2,2)),

    keras.layers.Conv2D(
        64,
        (3,3),
        activation='relu'
    ),
    keras.layers.MaxPooling2D((2,2)),

    keras.layers.Conv2D(
        64,
        (3,3),
        activation='relu'
    ),
    keras.layers.MaxPooling2D((2,2)),

    keras.layers.Flatten(),

    keras.layers.Dense(
        64,
        activation='relu'
    ),

    keras.layers.Dense(
        N_CLASSES,
        activation='softmax'
    )
])

model.build((None,256,256,3))

print("Architecture built")
model.load_weights("model.h5")

print("Weights loaded successfully!")
model.save("potato_model.keras")

print("Saved new model")