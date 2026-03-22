-- =========================================================================
-- GeoRoad MySQL / MySQL Spatial Schema (Academic Demonstration ONLY)
-- =========================================================================
-- This schema represents the reviewer demonstration equivalent of the 
-- GeoRoad project. It mirrors the constraints and structures of the true 
-- PostgreSQL/PostGIS backend using standard MySQL capabilities.

CREATE TABLE USERS (
    user_id INT AUTO_INCREMENT,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_users PRIMARY KEY (user_id),
    CONSTRAINT uk_email UNIQUE (email),
    CONSTRAINT chk_role CHECK (user_role IN ('USER', 'ADMIN'))
);

CREATE TABLE LOCATION (
    location_id INT AUTO_INCREMENT,
    region_name VARCHAR(200) NOT NULL,
    -- MySQL Native Spatial Type
    boundary POLYGON NOT NULL SRID 4326,
    CONSTRAINT pk_location PRIMARY KEY (location_id)
);

CREATE TABLE ROAD_TYPE (
    type_id INT AUTO_INCREMENT,
    type_name VARCHAR(100) NOT NULL,
    description TEXT,
    CONSTRAINT pk_road_type PRIMARY KEY (type_id),
    CONSTRAINT uk_type_name UNIQUE (type_name)
);

CREATE TABLE ROAD (
    road_id INT AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    length_km DECIMAL(10,2),
    location_id INT,
    type_id INT,
    -- Spatial Type for Road
    route LINESTRING NOT NULL SRID 4326,
    CONSTRAINT pk_road PRIMARY KEY (road_id),
    CONSTRAINT fk_road_loc FOREIGN KEY (location_id) REFERENCES LOCATION(location_id) ON DELETE CASCADE,
    CONSTRAINT fk_road_type FOREIGN KEY (type_id) REFERENCES ROAD_TYPE(type_id) ON DELETE SET NULL
);

CREATE TABLE CONDITION_CATEGORY (
    category_id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    severity_weight INT NOT NULL,
    CONSTRAINT pk_condition_category PRIMARY KEY (category_id),
    CONSTRAINT uk_category_name UNIQUE (name),
    CONSTRAINT chk_severity CHECK (severity_weight BETWEEN 1 AND 10)
);

CREATE TABLE ROAD_CONDITION (
    condition_id INT AUTO_INCREMENT,
    road_id INT NOT NULL,
    current_score INT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_road_condition PRIMARY KEY (condition_id),
    CONSTRAINT uk_road_condition_road UNIQUE (road_id),
    CONSTRAINT fk_rc_road FOREIGN KEY (road_id) REFERENCES ROAD(road_id) ON DELETE CASCADE,
    CONSTRAINT chk_rc_score CHECK (current_score BETWEEN 0 AND 100)
);

CREATE TABLE CNN_MODEL (
    model_id INT AUTO_INCREMENT,
    version VARCHAR(50) NOT NULL,
    accuracy DECIMAL(5,2),
    deployed_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_cnn_model PRIMARY KEY (model_id),
    CONSTRAINT uk_model_version UNIQUE (version),
    CONSTRAINT chk_accuracy CHECK (accuracy BETWEEN 0 AND 100)
);

CREATE TABLE CONDITION_REPORT (
    report_id INT AUTO_INCREMENT,
    road_id INT,
    user_id INT,
    model_id INT,
    score INT NOT NULL,
    is_ai_generated BOOLEAN NOT NULL DEFAULT FALSE,
    report_location POINT SRID 4326,
    report_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_condition_report PRIMARY KEY (report_id),
    CONSTRAINT fk_cr_road FOREIGN KEY (road_id) REFERENCES ROAD(road_id) ON DELETE CASCADE,
    CONSTRAINT fk_cr_user FOREIGN KEY (user_id) REFERENCES USERS(user_id) ON DELETE SET NULL,
    CONSTRAINT fk_cr_model FOREIGN KEY (model_id) REFERENCES CNN_MODEL(model_id) ON DELETE SET NULL,
    CONSTRAINT chk_cr_score CHECK (score BETWEEN 0 AND 100)
);

CREATE TABLE ROAD_IMAGE (
    image_id INT AUTO_INCREMENT,
    report_id INT,
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_road_image PRIMARY KEY (image_id),
    CONSTRAINT fk_ri_report FOREIGN KEY (report_id) REFERENCES CONDITION_REPORT(report_id) ON DELETE CASCADE
);

CREATE TABLE ADMIN_ACTION (
    action_id INT AUTO_INCREMENT,
    admin_id INT,
    report_id INT,
    action_type VARCHAR(100) NOT NULL,
    action_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_admin_action PRIMARY KEY (action_id),
    CONSTRAINT fk_aa_admin FOREIGN KEY (admin_id) REFERENCES USERS(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_aa_report FOREIGN KEY (report_id) REFERENCES CONDITION_REPORT(report_id) ON DELETE CASCADE
);

-- Note: MySQL uses Spatial Indexes (R-Trees).
CREATE SPATIAL INDEX idx_mysql_road_route ON ROAD(route);
CREATE SPATIAL INDEX idx_mysql_report_location ON CONDITION_REPORT(report_location);
CREATE SPATIAL INDEX idx_mysql_location_boundary ON LOCATION(boundary);
