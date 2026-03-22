-- =========================================================================
-- GeoRoad DBMS Lab Demonstration: Week 5
-- Subqueries, Joins, and Views
-- =========================================================================

-- ----------------------------------------------------
-- 1. Joins (For specific Application Pages)
-- ----------------------------------------------------

-- A. Admin Complaints Page
-- Join Users, Condition Reports, and Roads to show full details of complaints submitted by real people.
SELECT 
    cr.report_id,
    u.username AS complainant_name,
    u.email,
    cr.score AS reported_score,
    r.name AS road_name,
    cr.report_date
FROM CONDITION_REPORT cr
INNER JOIN USERS u ON cr.user_id = u.user_id
INNER JOIN ROAD r ON cr.road_id = r.road_id
WHERE cr.is_ai_generated = FALSE
ORDER BY cr.report_date DESC;

-- B. Road Details Page
-- Joins Road, Location, and Road Condition to show a comprehensive dashboard for a given road.
SELECT 
    r.name AS road_name,
    r.length_km,
    rt.type_name AS road_type,
    l.region_name,
    rc.current_score AS overall_condition_score
FROM ROAD r
LEFT JOIN ROAD_TYPE rt ON r.type_id = rt.type_id
JOIN LOCATION l ON r.location_id = l.location_id
LEFT JOIN ROAD_CONDITION rc ON r.road_id = rc.road_id;

-- C. Analytics Page
-- Joins to show how AI models perform compared to manual reporting.
SELECT 
    cm.version AS model_version,
    cm.accuracy,
    COUNT(cr.report_id) AS total_ai_reports_generated
FROM CNN_MODEL cm
LEFT JOIN CONDITION_REPORT cr ON cm.model_id = cr.model_id
GROUP BY cm.version, cm.accuracy;


-- ----------------------------------------------------
-- 2. Subqueries
-- ----------------------------------------------------

-- A. Roads below average score
-- Subquery calculates average, outer query filters roads lower than it.
SELECT road_id, current_score 
FROM ROAD_CONDITION
WHERE current_score < (
    SELECT AVG(current_score) FROM ROAD_CONDITION
);

-- B. Latest report per road
-- Correlated subquery fetching the maximum date for each road.
SELECT cr1.road_id, cr1.report_id, cr1.score, cr1.report_date 
FROM CONDITION_REPORT cr1
WHERE cr1.report_date = (
    SELECT MAX(cr2.report_date) 
    FROM CONDITION_REPORT cr2 
    WHERE cr2.road_id = cr1.road_id
);

-- C. Most complained roads (Roads with more reports than the average road)
SELECT road_id, COUNT(*) AS complaint_count 
FROM CONDITION_REPORT
GROUP BY road_id
HAVING COUNT(*) > (
    SELECT AVG(complaint_ratio)
    FROM (
        SELECT COUNT(*) AS complaint_ratio 
        FROM CONDITION_REPORT 
        GROUP BY road_id
    ) AS sub
);


-- ----------------------------------------------------
-- 3. Views
-- ----------------------------------------------------

-- A. road_status_summary
-- A comprehensive view displaying each road and its latest calculated score.
CREATE OR REPLACE VIEW road_status_summary AS
SELECT 
    r.road_id,
    r.name AS road_name,
    l.region_name AS region,
    IFNULL(rc.current_score, 'No Data') AS current_condition_score,
    rc.last_updated
FROM ROAD r
JOIN LOCATION l ON r.location_id = l.location_id
LEFT JOIN ROAD_CONDITION rc ON r.road_id = rc.road_id;

-- Usage:
-- SELECT * FROM road_status_summary WHERE current_condition_score > 50;


-- B. complaint_analysis_view
-- A view aggregating the daily breakdown of AI versus User generated reports per road.
CREATE OR REPLACE VIEW complaint_analysis_view AS
SELECT 
    r.name AS road_name,
    DATE(cr.report_date) AS report_day,
    SUM(CASE WHEN cr.is_ai_generated = TRUE THEN 1 ELSE 0 END) AS ai_reports,
    SUM(CASE WHEN cr.is_ai_generated = FALSE THEN 1 ELSE 0 END) AS user_complaints,
    AVG(cr.score) AS daily_avg_score
FROM CONDITION_REPORT cr
JOIN ROAD r ON cr.road_id = r.road_id
GROUP BY r.name, DATE(cr.report_date);

-- Usage:
-- SELECT * FROM complaint_analysis_view ORDER BY report_day DESC;
