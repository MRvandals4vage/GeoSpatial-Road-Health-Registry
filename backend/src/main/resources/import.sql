-- Initialize H2GIS for spatial support
CREATE ALIAS IF NOT EXISTS H2GIS_SPATIAL FOR "org.h2gis.functions.factory.H2GISFunctions.load";
CALL H2GIS_SPATIAL();

-- 1. Insert Users
-- Note: password is 'password123' for all
INSERT INTO users (user_id, user_name, email_address, password, role) VALUES 
('u1', 'Admin User', 'admin@georoad.com', 'admin', 'ADMIN'),
('u2', 'Jane Doe', 'jane@georoad.com', 'password', 'USER');

-- 2. Insert Road Types
INSERT INTO road_types (type_id, type_name) VALUES 
('t1', 'HIGHWAY'),
('t2', 'ARTERIAL'),
('t3', 'LOCAL');

-- 3. Insert Roads (Coordinates: [lng, lat])
INSERT INTO roads (road_id, osm_id, name, type_id, geometry) VALUES 
('r1', 'OSM123', 'Main Street', 't3', ST_GeomFromText('LINESTRING(77.5946 12.9716, 77.5946 12.9816)', 4326)),
('r2', 'OSM456', 'Valley Highway', 't1', ST_GeomFromText('LINESTRING(77.6146 12.9916, 77.6346 13.0116)', 4326)),
('r3', 'OSM789', 'Elm Street', 't3', ST_GeomFromText('LINESTRING(77.5846 12.9516, 77.5846 12.9616)', 4326));

-- 4. Insert Initial Road Conditions
INSERT INTO road_conditions (road_id, category, condition_score, source, last_updated) VALUES 
('r1', 'GOOD', 95.0, 'INITIAL_SEED', CURRENT_TIMESTAMP),
('r2', 'SEVERE', 20.0, 'INITIAL_SEED', CURRENT_TIMESTAMP),
('r3', 'MODERATE', 65.0, 'INITIAL_SEED', CURRENT_TIMESTAMP);

-- 5. Insert Condition Reports
INSERT INTO condition_reports (report_id, road_id, user_id, user_comment, reported_condition, confidence_score, point_location) VALUES 
('rep1', 'r2', 'u2', 'Huge pothole near the turn', 'SEVERE', 0.92, ST_GeomFromText('POINT(77.6246 13.0016)', 4326));
