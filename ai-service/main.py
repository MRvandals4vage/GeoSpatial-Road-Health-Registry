from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import random
import time

app = FastAPI()

class PredictionResponse(BaseModel):
    predicted_condition: str
    confidence_score: float

@app.post("/predict", response_model=PredictionResponse)
async def predict(image: UploadFile = File(...)):
    # Simulate processing time
    time.sleep(1.5)
    
    # Simple logic based on filename as a proxy for visual detection
    filename = image.filename.lower()
    
    if any(k in filename for k in ["pothole", "crack", "damage", "severe"]):
        condition = "SEVERE"
        confidence = random.uniform(0.85, 0.98)
    elif any(k in filename for k in ["wear", "faded", "moderate"]):
        condition = "MODERATE"
        confidence = random.uniform(0.70, 0.85)
    else:
        condition = "GOOD"
        confidence = random.uniform(0.90, 0.99)
        
    return {
        "predicted_condition": condition,
        "confidence_score": round(confidence, 4)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
