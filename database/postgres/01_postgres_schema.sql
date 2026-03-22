-- =========================================================================
-- GeoRoad PostgreSQL / PostGIS Schema
-- =========================================================================
-- This is the actual production backend database schema running Spring Boot.
-- It requires the PostGIS extension for geospatial functionality.

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE USERS (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL CHECK (user_role IN ('USER', 'ADMIN')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE LOCATION (
    location_id SERIAL PRIMARY KEY,
    region_name VARCHAR(200) NOT NULL,
    -- Bounding box or center point of the region
    boundary GEOMETRY(POLYGON, 4326)
);

CREATE TABLE ROAD_TYPE (
    type_id SERIAL PRIMARY KEY,
    type_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE ROAD (
    road_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    length_km DECIMAL(10,2),
    location_id INT REFERENCES LOCATION(location_id) ON DELETE CASCADE,
    type_id INT REFERENCES ROAD_TYPE(type_id) ON DELETE SET NULL,
    -- The actual path of the road
    route GEOMETRY(LINESTRING, 4326) NOT NULL
);

CREATE TABLE CONDITION_CATEGORY (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    severity_weight INT NOT NULL CHECK (severity_weight BETWEEN 1 AND 10)
);

-- Denormalized table to hold current road condition state
CREATE TABLE ROAD_CONDITION (
    condition_id SERIAL PRIMARY KEY,
    road_id INT UNIQUE REFERENCES ROAD(road_id) ON DELETE CASCADE,
    current_score INT NOT NULL CHECK (current_score BETWEEN 0 AND 100),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE CNN_MODEL (
    model_id SERIAL PRIMARY KEY,
    version VARCHAR(50) UNIQUE NOT NULL,
    accuracy DECIMAL(5,2) CHECK (accuracy BETWEEN 0 AND 100),
    deployed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Historical individual reports
CREATE TABLE CONDITION_REPORT (
    report_id SERIAL PRIMARY KEY,
    road_id INT REFERENCES ROAD(road_id) ON DELETE CASCADE,
    user_id INT REFERENCES USERS(user_id) ON DELETE SET NULL,
    model_id INT REFERENCES CNN_MODEL(model_id) ON DELETE SET NULL,
    score INT NOT NULL CHECK (score BETWEEN 0 AND 100),
    is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    report_location GEOMETRY(POINT, 4326),
    report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ROAD_IMAGE (
    image_id SERIAL PRIMARY KEY,
    report_id INT REFERENCES CONDITION_REPORT(report_id) ON DELETE CASCADE,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ADMIN_ACTION (
    action_id SERIAL PRIMARY KEY,
    admin_id INT REFERENCES USERS(user_id) ON DELETE CASCADE,
    report_id INT REFERENCES CONDITION_REPORT(report_id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create a spatial index for fast geographical searches
CREATE INDEX idx_road_route ON ROAD USING GIST (route);
CREATE INDEX idx_report_location ON CONDITION_REPORT USING GIST (report_location);
CREATE INDEX idx_location_boundary ON LOCATION USING GIST (boundary);
