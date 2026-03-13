const { v4: uuidv4 } = require('uuid');

// In-memory "Tables"
let USERS = [
    { UserID: 'u1', UserName: 'Admin', EmailAddress: 'admin@georoad.com', Role: 'ADMIN' },
    { UserID: 'u2', UserName: 'Inspector John', EmailAddress: 'john@georoad.com', Role: 'INSPECTOR' }
];

let LOCATIONS = [
    { LocationID: 'L1', City: 'New Delhi', State: 'Delhi', Bbox: 'POLYGON((...))' }
];

let ROAD_TYPES = [
    { TypeID: 'T1', Type_Name: 'HIGHWAY' },
    { TypeID: 'T2', Type_Name: 'ARTERIAL' },
    { TypeID: 'T3', Type_Name: 'LOCAL' }
];

let CONDITION_CATEGORIES = [
    { CategoryID: 'C1', Category_Name: 'GOOD' },
    { CategoryID: 'C2', Category_Name: 'MODERATE' },
    { CategoryID: 'C3', Category_Name: 'SEVERE' }
];

let CNN_MODELS = [
    { ModelID: 'm1', Model_Name: 'RoadNet-V1', Version: '1.2.0', Accuracy: 0.94 }
];

// Load roads from the mock data logic or just start empty and populate
let ROADS = [];
let ROAD_CONDITIONS = {}; // RoadID -> { CategoryID, Condition_Score, Source, Last_Updated }
let CONDITION_REPORTS = [];
let ROAD_IMAGES = [];
let ADMIN_ACTIONS = [];

// Initialize some roads (mapping fromOsmID to our PK)
function initializeData(roadsData) {
    ROADS = roadsData.map(r => ({
        RoadID: r.id,
        OsmID: r.id.split('_')[1],
        Name: r.name,
        Geometry: r.path, // LineString
        LocationID: 'L1',
        TypeID: 'T1'
    }));

    ROADS.forEach(r => {
        const roadOrig = roadsData.find(x => x.id === r.RoadID);
        ROAD_CONDITIONS[r.RoadID] = {
            CategoryID: roadOrig.condition === 'GOOD' ? 'C1' : (roadOrig.condition === 'MODERATE' ? 'C2' : 'C3'),
            Condition_Score: roadOrig.conditionScore,
            Source: 'INITIAL',
            Last_Updated: roadOrig.lastInspected
        };
    });
}

module.exports = {
    USERS,
    LOCATIONS,
    ROAD_TYPES,
    CONDITION_CATEGORIES,
    CNN_MODELS,
    ROADS,
    ROAD_CONDITIONS,
    CONDITION_REPORTS,
    ROAD_IMAGES,
    ADMIN_ACTIONS,
    initializeData,
    uuidv4
};
