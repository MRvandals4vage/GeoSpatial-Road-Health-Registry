-- database/postgres/03_week5_joins_subqueries_views.sql
-- Satisfies Rubric: Complex Queries using Subqueries, Joins, and Views

-- ==========================================
-- 1. VIEWS (To be used by Spring Boot backend)
-- ==========================================

-- A. road_status_summary View (Used for Dashboard)
CREATE OR REPLACE VIEW road_status_summary AS
SELECT 
    r.road_id,
    r.name AS road_name,
    l.region_name,
    cc.category_name AS current_status,
    rc.condition_score,
    COUNT(cr.report_id) AS total_complaints
FROM roads r
LEFT JOIN locations l ON r.location_id = l.location_id
LEFT JOIN road_conditions rc ON r.road_id = rc.road_id
LEFT JOIN condition_categories cc ON rc.category_id = cc.category_id
LEFT JOIN condition_reports cr ON r.road_id = cr.road_id
GROUP BY r.road_id, r.name, l.region_name, cc.category_name, rc.condition_score;

-- B. complaint_analysis_view View (Used for Analytics Page)
CREATE OR REPLACE VIEW complaint_analysis_view AS
SELECT 
    cr.report_id,
    r.name AS road_name,
    u.full_name AS reported_by_user,
    cm.version_tag AS flagged_by_ai,
    cr.reported_score,
    cr.status,
    cr.reported_at
FROM condition_reports cr
INNER JOIN roads r ON cr.road_id = r.road_id
LEFT JOIN users u ON cr.user_id = u.user_id
LEFT JOIN cnn_models cm ON cr.model_id = cm.model_id;

-- C. severe_road_alert_view View (Used for Alerts Page)
CREATE OR REPLACE VIEW severe_road_alert_view AS
SELECT 
    r.road_id,
    r.name AS road_name,
    l.region_name,
    rc.condition_score,
    cr.reported_at AS initial_alert_time
FROM roads r
JOIN road_conditions rc ON r.road_id = rc.road_id
JOIN locations l ON r.location_id = l.location_id
JOIN condition_reports cr ON r.road_id = cr.road_id
WHERE rc.condition_score < 40 AND cr.status = 'PENDING'
ORDER BY rc.condition_score ASC;

-- D. latest_report_per_road_view View
CREATE OR REPLACE VIEW latest_report_per_road_view AS
SELECT cr.* 
FROM condition_reports cr
WHERE cr.reported_at = (
    SELECT MAX(reported_at)
    FROM condition_reports cr2
    WHERE cr2.road_id = cr.road_id
);

-- ==========================================
-- 2. JOINS
-- ==========================================

-- Multi-table JOIN (Used for Admin Complaints Review Page)
SELECT 
    cr.report_id, r.name AS road, l.region_name AS location, 
    u.full_name AS reporter, cc.category_name AS severity, 
    cr.reported_score, ri.image_url
FROM condition_reports cr
INNER JOIN roads r ON cr.road_id = r.road_id
INNER JOIN locations l ON r.location_id = l.location_id
LEFT JOIN users u ON cr.user_id = u.user_id
INNER JOIN road_conditions rc ON r.road_id = rc.road_id
LEFT JOIN condition_categories cc ON rc.category_id = cc.category_id
LEFT JOIN road_images ri ON cr.report_id = ri.report_id;

-- RIGHT JOIN Example: 
-- Show all condition categories and any roads that fall into them. (Postgres friendly right join usage)
SELECT cc.category_name, r.name AS road_name
FROM road_conditions rc
JOIN roads r ON rc.road_id = r.road_id
RIGHT JOIN condition_categories cc ON rc.category_id = cc.category_id;

-- ==========================================
-- 3. SUBQUERIES (Correlated & Nested)
-- ==========================================

-- Roads below average condition score (Nested Subquery)
SELECT r.name, rc.condition_score
FROM roads r
JOIN road_conditions rc ON r.road_id = rc.road_id
WHERE rc.condition_score < (
    SELECT AVG(condition_score) FROM road_conditions
);

-- Roads with more complaints than the average road (Correlated Aggregate Subquery)
SELECT r.name, COUNT(cr.report_id) AS num_complaints
FROM roads r
JOIN condition_reports cr ON r.road_id = cr.road_id
GROUP BY r.road_id, r.name
HAVING COUNT(cr.report_id) > (
    SELECT AVG(complaint_count)
    FROM (
        SELECT COUNT(report_id) AS complaint_count
        FROM condition_reports
        GROUP BY road_id
    ) AS avg_complaints
);

-- Locations with the worst average road health (Aggregate Subquery)
SELECT region_name, avg_health
FROM (
    SELECT l.region_name, AVG(rc.condition_score) AS avg_health
    FROM locations l
    JOIN roads r ON l.location_id = r.location_id
    JOIN road_conditions rc ON r.road_id = rc.road_id
    GROUP BY l.region_name
) region_health
WHERE avg_health < 50;
