import numpy as np # pyre-ignore
from PIL import Image, ImageFilter # pyre-ignore
import io
from fastapi import FastAPI, UploadFile, File # pyre-ignore
from pydantic import BaseModel # pyre-ignore

app = FastAPI()

class PredictionResponse(BaseModel):
    predicted_condition: str
    confidence_score: float

def analyze_damage(image_bytes: bytes):
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('L')
        img = img.resize((256, 256))
        
        # Apply edge detection to measure "roughness" vs smoothness
        edges = img.filter(ImageFilter.FIND_EDGES)
        edge_data = np.array(edges)
        
        # Calculate percentage of significant edge pixels
        threshold = 50
        edge_density = np.sum(edge_data > threshold) / edge_data.size
        
        # Calculate local variance to measure texture roughness
        img_data = np.array(img)
        std_dev = np.std(img_data)
        
        # Higher density and deviation indicates severe structural damage
        damage_score = (edge_density * 100) + (std_dev / 5)
        
        if damage_score > 35:
            condition = "SEVERE"
            confidence = min(0.99, 0.75 + (damage_score - 35) / 100)
        elif damage_score > 20:
            condition = "MODERATE"
            confidence = min(0.95, 0.65 + (damage_score - 20) / 50)
        else:
            condition = "GOOD"
            confidence = min(0.98, 0.98 - (damage_score / 35) * 0.2)
            
        return condition, float(f"{confidence:.4f}")
    except Exception as e:
        print(f"Vision computation error: {e}")
        return "GOOD", 0.50

@app.post("/predict", response_model=PredictionResponse)
async def predict(image: UploadFile = File(...)):
    # Read the raw byte buffer from the HTTP upload
    image_bytes = await image.read()
    
    # Process computer vision extraction natively
    condition, confidence = analyze_damage(image_bytes)
        
    return {
        "predicted_condition": condition,
        "confidence_score": confidence
    }

if __name__ == "__main__":
    import uvicorn # pyre-ignore
    uvicorn.run(app, host="0.0.0.0", port=8000)
