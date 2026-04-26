-- database/mysql/mysql_schema_demo.sql
-- Satisfies Rubric: MySQL Schema Constraints Demo (Parallel to Postgres)
-- LIMITATION: MySQL is used for academic demonstration only. 
--             PostgreSQL with PostGIS is our actual geospatial workhorse. 
--             We substitute GEOMETRY(POINT, 4326) with basic POINT in MySQL, 
--             and UUIDs with VARCHAR(36).

CREATE TABLE locations (
    location_id VARCHAR(36) PRIMARY KEY,
    region_name VARCHAR(100) NOT NULL UNIQUE,
    polygon_area POLYGON
);

CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cnn_models (
    model_id VARCHAR(36) PRIMARY KEY,
    version_tag VARCHAR(50) NOT NULL UNIQUE,
    accuracy_score DECIMAL(5,2) CHECK (accuracy_score BETWEEN 0 AND 100),
    is_active BOOLEAN DEFAULT false,
    deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE road_types (
    type_id VARCHAR(36) PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE roads (
    road_id VARCHAR(36) PRIMARY KEY,
    osm_id VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    geometry LINESTRING,
    type_id VARCHAR(36),
    location_id VARCHAR(36),
    FOREIGN KEY (type_id) REFERENCES road_types(type_id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES locations(location_id) ON DELETE SET NULL
);

CREATE TABLE condition_categories (
    category_id VARCHAR(36) PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    severity_level INT NOT NULL CHECK (severity_level BETWEEN 1 AND 5)
);

CREATE TABLE road_conditions (
    condition_id VARCHAR(36) PRIMARY KEY,
    road_id VARCHAR(36) NOT NULL UNIQUE,
    condition_score DECIMAL(5,2) NOT NULL CHECK (condition_score >= 0 AND condition_score <= 100),
    category_id VARCHAR(36),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (road_id) REFERENCES roads(road_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES condition_categories(category_id) ON DELETE SET NULL
);

CREATE TABLE condition_reports (
    report_id VARCHAR(36) PRIMARY KEY,
    road_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36),
    model_id VARCHAR(36),
    point_location POINT,
    reported_score DECIMAL(5,2) NOT NULL CHECK (reported_score >= 0 AND reported_score <= 100),
    user_comment TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'RESOLVED')),
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (road_id) REFERENCES roads(road_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (model_id) REFERENCES cnn_models(model_id) ON DELETE SET NULL,
    CONSTRAINT check_source_exists CHECK (user_id IS NOT NULL OR model_id IS NOT NULL)
);

CREATE TABLE admin_actions (
    action_id VARCHAR(36) PRIMARY KEY,
    admin_id VARCHAR(36) NOT NULL,
    report_id VARCHAR(36) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    remarks TEXT,
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (report_id) REFERENCES condition_reports(report_id) ON DELETE CASCADE
);
