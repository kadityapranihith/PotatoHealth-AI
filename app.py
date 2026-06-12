from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from predict import predict_image
import shutil
import os
from database import init_db,save_prediction,get_history,clear_history

init_db()
app = FastAPI(title="Potato Disease Detection API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    file_path = file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = predict_image(file_path)
    save_prediction(
        file.filename,
        result["disease"],
        result["confidence"]
    )
    if os.path.exists(file_path):
        os.remove(file_path)


    return result

@app.get("/history")
def history():

    rows = get_history()

    result = []

    for row in rows:

        result.append({
            "id": row[0],
            "filename": row[1],
            "disease": row[2],
            "confidence": row[3],
            "timestamp": row[4]
        })

    return result

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.delete("/history")
def delete_history():

    clear_history()

    return {
        "message": "Prediction history cleared successfully"
    }