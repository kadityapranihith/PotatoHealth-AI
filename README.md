# PotatoVision AI

A FastAPI-powered web application that detects potato leaf diseases using a deep learning model and provides prediction history with an interactive dashboard.

## Features

- Upload potato leaf images for disease detection
- Predict:
  - Healthy
  - Early Blight
  - Late Blight
- Confidence score for predictions
- Prediction history tracking
- Dashboard with statistics
- Delete prediction history
- REST API endpoints
- Interactive frontend using HTML, CSS, and JavaScript

## Tech Stack

### Backend
- Python
- FastAPI
- SQLite
- Uvicorn

### Machine Learning
- TensorFlow / Keras
- NumPy
- Pillow

### Frontend
- HTML
- CSS
- JavaScript

## Project Structure

```text
project/
│
├── app.py
├── predictions.db
├── requirements.txt
│
├── frontend/
│   ├── index.html
│   ├── css/
│   └── js/
│
├── potato_model.keras
│
└── README.md
```

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd project
```

### Create Virtual Environment

```bash
python -m venv venv
```

### Activate Environment

Windows:

```bash
venv\Scripts\activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run Application

```bash
uvicorn app:app --reload
```

## API Endpoints

### Predict Disease

```http
POST /predict
```

### Get Prediction History

```http
GET /history
```

### Delete Prediction History

```http
DELETE /history
```



## Disease Classes

| Class | Description |
|---------|-------------|
| Healthy | Healthy potato leaf |
| Early Blight | Early stage fungal infection |
| Late Blight | Severe fungal infection |

## Future Improvements

- User authentication
- Cloud database integration
- Image storage
- Disease treatment recommendations
- Mobile-friendly UI
- Docker deployment
