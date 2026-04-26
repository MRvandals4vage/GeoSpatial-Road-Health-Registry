-- database/postgres/01_schema_constraints.sql
-- Satisfies Rubric: Constraints (PK, FK, UNIQUE, NOT NULL, CHECK)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS locations (
    location_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    region_name VARCHAR(100) NOT NULL UNIQUE,
    polygon_area GEOMETRY(Polygon, 4326)
);

CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cnn_models (
    model_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version_tag VARCHAR(50) NOT NULL UNIQUE,
    accuracy_score NUMERIC(5,2) CHECK (accuracy_score BETWEEN 0 AND 100),
    is_active BOOLEAN DEFAULT false,
    deployed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS road_types (
    type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE IF NOT EXISTS roads (
    road_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    osm_id VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    geometry GEOMETRY(LineString, 4326),
    type_id UUID REFERENCES road_types(type_id) ON DELETE SET NULL,
    location_id UUID REFERENCES locations(location_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS condition_categories (
    category_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_name VARCHAR(50) NOT NULL UNIQUE,
    severity_level INT NOT NULL CHECK (severity_level BETWEEN 1 AND 5)
);

CREATE TABLE IF NOT EXISTS road_conditions (
    condition_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    road_id UUID NOT NULL UNIQUE REFERENCES roads(road_id) ON DELETE CASCADE,
    condition_score NUMERIC(5,2) NOT NULL CHECK (condition_score >= 0 AND condition_score <= 100),
    category_id UUID REFERENCES condition_categories(category_id) ON DELETE SET NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS condition_reports (
    report_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    road_id UUID NOT NULL REFERENCES roads(road_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    model_id UUID REFERENCES cnn_models(model_id) ON DELETE SET NULL,
    point_location GEOMETRY(Point, 4326),
    reported_score NUMERIC(5,2) NOT NULL CHECK (reported_score >= 0 AND reported_score <= 100),
    user_comment TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'RESOLVED')),
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_source_exists CHECK (user_id IS NOT NULL OR model_id IS NOT NULL)
);

CREATE TABLE IF NOT EXISTS road_images (
    image_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID NOT NULL REFERENCES condition_reports(report_id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_actions (
    action_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    report_id UUID NOT NULL REFERENCES condition_reports(report_id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL,
    remarks TEXT,
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
