const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const db = require('./database');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// CNN Prediction Simulator
function simulateCNN(imagePath) {
    const filename = imagePath.toLowerCase();
    let condition = 'C1'; // GOOD
    let score = Math.floor(Math.random() * 20) + 80;
    let categoryName = 'GOOD';

    if (filename.includes('pothole') || filename.includes('damage') || filename.includes('crack')) {
        condition = 'C3'; // SEVERE
        score = Math.floor(Math.random() * 30) + 10;
        categoryName = 'SEVERE';
    } else if (filename.includes('wear') || filename.includes('faded')) {
        condition = 'C2'; // MODERATE
        score = Math.floor(Math.random() * 30) + 45;
        categoryName = 'MODERATE';
    }

    return { 
        CategoryID: condition, 
        CategoryName: categoryName,
        Score: score, 
        Confidence: (Math.random() * 0.1 + 0.85).toFixed(4) // 85-95%
    };
}

// ─── API Routes ──────────────────────────────────

app.get('/api/roads', (req, res) => {
    const results = db.ROADS.map(r => {
        const cond = db.ROAD_CONDITIONS[r.RoadID];
        const category = db.CONDITION_CATEGORIES.find(c => c.CategoryID === cond.CategoryID);
        const history = db.CONDITION_REPORTS.filter(h => h.RoadID === r.RoadID);
        return {
            id: r.RoadID,
            name: r.Name,
            path: r.Geometry,
            condition: category.Category_Name,
            conditionScore: cond.Condition_Score,
            lastInspected: cond.Last_Updated,
            history: history.map(h => ({
                id: h.ReportID,
                roadId: h.RoadID,
                conditionScore: h.Predicted_Condition === 'GOOD' ? 90 : (h.Predicted_Condition === 'MODERATE' ? 60 : 20),
                conditionCategory: h.Predicted_Condition,
                timestamp: h.Reported_At,
                source: h.UserID ? 'MANUAL' : 'AI'
            }))
        };
    });
    res.json(results);
});

app.get('/api/roads/:id/history', (req, res) => {
    const reports = db.CONDITION_REPORTS.filter(rep => rep.RoadID === req.params.id);
    res.json(reports);
});

app.post('/api/upload', upload.single('image'), async (req, res) => {
    const { roadId, userId } = req.body;
    if (!req.file || !roadId) {
        return res.status(400).json({ error: 'Image and roadId are required' });
    }

    const imagePath = `/uploads/${req.file.filename}`;
    
    // 1. Store in ROAD_IMAGE
    const imageId = db.uuidv4();
    db.ROAD_IMAGES.push({
        ImageID: imageId,
        RoadID: roadId,
        Image_Path: imagePath,
        Captured_At: new Date().toISOString()
    });

    // 2. Pass to CNN (Simulated)
    const prediction = simulateCNN(req.file.filename);

    // 3. Store prediction in CONDITION_REPORT
    const reportId = db.uuidv4();
    const report = {
        ReportID: reportId,
        RoadID: roadId,
        UserID: userId || 'u1',
        ModelID: 'm1',
        Predicted_Condition: prediction.CategoryName,
        Confidence_Score: prediction.Confidence,
        Reported_At: new Date().toISOString()
    };
    db.CONDITION_REPORTS.push(report);

    // 4. Update ROAD_CONDITION
    db.ROAD_CONDITIONS[roadId] = {
        CategoryID: prediction.CategoryID,
        Condition_Score: prediction.Score,
        Source: 'AI_CNN',
        Last_Updated: report.Reported_At
    };

    res.json({
        success: true,
        report,
        prediction: {
            score: prediction.Score,
            category: prediction.CategoryName,
            confidence: prediction.Confidence
        }
    });
});

// Seed data from FE (optional but helpful for MVP sync)
app.post('/api/seed', (req, res) => {
    db.initializeData(req.body.roads);
    res.json({ success: true, count: db.ROADS.length });
});

// Initial mock data if empty
if (db.ROADS.length === 0) {
    // We'll let the frontend seed it on first load or just create a few
    console.log("Waiting for seed data or empty start...");
}

app.get('/api/alerts', (req, res) => {
    // Generate alerts based on severe conditions in the DB
    const alerts = [];
    Object.entries(db.ROAD_CONDITIONS).forEach(([roadId, cond]) => {
        if (cond.CategoryID === 'C3') { // SEVERE
            const road = db.ROADS.find(r => r.RoadID === roadId);
            alerts.push({
                id: `alert-${roadId}`,
                roadId: roadId,
                roadName: road ? road.Name : 'Unknown',
                severity: 'HIGH',
                currentScore: cond.Condition_Score,
                timestamp: cond.Last_Updated
            });
        }
    });
    res.json(alerts);
});

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
