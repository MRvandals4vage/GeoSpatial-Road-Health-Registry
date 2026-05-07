-- Initialize H2GIS
CREATE ALIAS IF NOT EXISTS H2GIS_SPATIAL FOR "org.h2gis.functions.factory.H2GISFunctions.load";
CALL H2GIS_SPATIAL();

-- 1. Insert Users
INSERT INTO users (user_id, user_name, email_address, password, role) VALUES ('u1', 'System Admin', 'admin@georoad.com', 'admin', 'ADMIN');
INSERT INTO users (user_id, user_name, email_address, password, role) VALUES ('u2', 'Test User', 'user@georoad.com', 'password', 'USER');

-- 2. Insert Road Types
INSERT INTO road_types (type_id, type_name) VALUES ('t1', 'HIGHWAY');
INSERT INTO road_types (type_id, type_name) VALUES ('t2', 'CAMPUS_ROAD');
INSERT INTO road_types (type_id, type_name) VALUES ('t3', 'SERVICE_ROAD');

-- 3. Insert Roads (Coordinates for SRM KTR Campus, Chennai)
INSERT INTO roads (road_id, osm_id, name, type_id, geometry) VALUES ('r1', 'SRM001', 'GST Road Entry', 't1', ST_GeomFromText('LINESTRING(80.0442 12.8231, 80.0450 12.8240, 80.0460 12.8250)', 4326));
INSERT INTO roads (road_id, osm_id, name, type_id, geometry) VALUES ('r2', 'SRM002', 'Library Block Road', 't2', ST_GeomFromText('LINESTRING(80.0450 12.8247, 80.0440 12.8245, 80.0430 12.8243)', 4326));
INSERT INTO roads (road_id, osm_id, name, type_id, geometry) VALUES ('r3', 'SRM003', 'Tech Park Avenue', 't2', ST_GeomFromText('LINESTRING(80.0390 12.8210, 80.0400 12.8220, 80.0410 12.8230)', 4326));

-- 4. Insert Initial Road Conditions
INSERT INTO road_conditions (road_id, category, condition_score, source, last_updated) VALUES ('r1', 'GOOD', 88.0, 'INITIAL_SEED', CURRENT_TIMESTAMP);
INSERT INTO road_conditions (road_id, category, condition_score, source, last_updated) VALUES ('r2', 'SEVERE', 15.0, 'INITIAL_SEED', CURRENT_TIMESTAMP);
INSERT INTO road_conditions (road_id, category, condition_score, source, last_updated) VALUES ('r3', 'MODERATE', 55.0, 'INITIAL_SEED', CURRENT_TIMESTAMP);

-- 5. Insert Condition Reports (Dummy reports for SRM)
INSERT INTO condition_reports (report_id, road_id, user_id, user_comment, predicted_condition, confidence_score, point_location, status, reported_at) VALUES ('rep1', 'r2', 'u2', 'Large pothole near Java Canteen', 'SEVERE', 0.94, ST_GeomFromText('POINT(80.0445 12.8246)', 4326), 'PENDING', CURRENT_TIMESTAMP);
INSERT INTO condition_reports (report_id, road_id, user_id, user_comment, predicted_condition, confidence_score, point_location, status, reported_at) VALUES ('rep2', 'r3', 'u2', 'Water logging near Tech Park', 'MODERATE', 0.82, ST_GeomFromText('POINT(80.0405 12.8225)', 4326), 'PENDING', CURRENT_TIMESTAMP);
INSERT INTO condition_reports (report_id, road_id, user_id, user_comment, predicted_condition, confidence_score, point_location, status, reported_at) VALUES ('rep3', 'r1', 'u1', 'Surface cracks emerging near gate', 'MODERATE', 0.75, ST_GeomFromText('POINT(80.0448 12.8238)', 4326), 'APPROVED', CURRENT_TIMESTAMP);
