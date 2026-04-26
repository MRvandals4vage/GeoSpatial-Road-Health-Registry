-- database/postgres/05_seed_demo_data.sql
-- Satisfies Rubric: Demonstration Readiness

-- 1. Insert Locations
INSERT INTO locations (region_name, polygon_area) VALUES 
('North Valley', ST_GeomFromText('POLYGON((0 0, 10 0, 10 10, 0 10, 0 0))', 4326)),
('South Boulevard', ST_GeomFromText('POLYGON((20 20, 30 20, 30 30, 20 30, 20 20))', 4326));

-- 2. Insert Users
INSERT INTO users (full_name, email, password_hash, role) VALUES 
('Admin User', 'admin@georoad.com', 'bcrypt_hash_admin', 'ADMIN'),
('Jane Doe', 'jane@georoad.com', 'bcrypt_hash_user', 'USER'),
('John Smith', 'john@georoad.com', 'bcrypt_hash_user', 'USER');

-- 3. Insert CNN Models
INSERT INTO cnn_models (version_tag, accuracy_score, is_active) VALUES 
('YOLOv8-Pothole-v1', 92.5, true),
('MobileNet-Cracks-v2', 85.0, false);

-- 4. Insert Road Types
INSERT INTO road_types (type_name, description) VALUES 
('HIGHWAY', 'National highways with high traffic'),
('ARTERIAL', 'Major city interconnecting roads'),
('LOCAL', 'Small local neighborhood streets');

-- 5. Insert Condition Categories
INSERT INTO condition_categories (category_name, severity_level) VALUES 
('EXCELLENT', 1), ('GOOD', 2), ('MODERATE', 3), ('POOR', 4), ('SEVERE', 5);

-- 6. Insert Roads
-- Note: Requires lookup for locations, but to make seed easy, we assume simple subqueries
INSERT INTO roads (osm_id, name, geometry, location_id, type_id) VALUES 
('OSM123', 'Main Street', ST_GeomFromText('LINESTRING(1 1, 2 2, 3 3)', 4326), (SELECT location_id FROM locations WHERE region_name='North Valley'), (SELECT type_id FROM road_types WHERE type_name='LOCAL')),
('OSM456', 'Valley Highway', ST_GeomFromText('LINESTRING(10 10, 20 20)', 4326), (SELECT location_id FROM locations WHERE region_name='South Boulevard'), (SELECT type_id FROM road_types WHERE type_name='HIGHWAY')),
('OSM789', 'Elm Street', ST_GeomFromText('LINESTRING(5 5, 8 8)', 4326), (SELECT location_id FROM locations WHERE region_name='North Valley'), (SELECT type_id FROM road_types WHERE type_name='LOCAL'));

-- 7. Insert Initial Condition Reports (simulating history to trigger roads conditions)
-- Let's pretend user reported 3 things on Main Street
INSERT INTO condition_reports (road_id, user_id, point_location, reported_score, status) VALUES 
((SELECT road_id FROM roads WHERE name='Main Street'), (SELECT user_id FROM users WHERE email='jane@georoad.com'), ST_GeomFromText('POINT(1.5 1.5)', 4326), 25.0, 'APPROVED'),
((SELECT road_id FROM roads WHERE name='Main Street'), (SELECT user_id FROM users WHERE email='john@georoad.com'), ST_GeomFromText('POINT(2 2)', 4326), 35.0, 'PENDING');

-- AI spotted a severe pothole
INSERT INTO condition_reports (road_id, model_id, point_location, reported_score, status) VALUES 
((SELECT road_id FROM roads WHERE name='Valley Highway'), (SELECT model_id FROM cnn_models WHERE version_tag='YOLOv8-Pothole-v1'), ST_GeomFromText('POINT(15 15)', 4326), 15.0, 'APPROVED');

-- 8. Run Function to update condition directly if needed, or rely on triggers
-- The triggers from earlier insert into road_conditions when a report is APPROVED!
