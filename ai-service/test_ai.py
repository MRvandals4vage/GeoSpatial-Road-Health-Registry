import numpy as np # pyre-ignore
from PIL import Image, ImageFilter # pyre-ignore
import io
import os

def analyze_damage(image_path: str):
    img = Image.open(image_path).convert('L')
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
    
    damage_score = (edge_density * 100) + (std_dev / 5)
    
    if damage_score > 25:
        condition = "SEVERE"
        confidence = min(0.99, 0.75 + (damage_score - 25) / 100)
    elif damage_score > 12:
        condition = "MODERATE"
        confidence = min(0.95, 0.65 + (damage_score - 12) / 50)
    else:
        condition = "GOOD"
        confidence = min(0.98, 0.98 - (damage_score / 30) * 0.2)
        
    print(f"File: {os.path.basename(image_path)} | Score: {damage_score:.2f} | Cond: {condition} | Conf: {confidence:.2f}")

try:
    files = [x for x in os.listdir('../backend/uploads') if x.endswith(('.webp', '.jpg', '.png'))]
    if files:
        limit = min(3, len(files))
        for i in range(limit):
            analyze_damage('../backend/uploads/' + files[i])
    else:
        print("No images found.")
except Exception as e:
    print(f"Error: {e}")
