-- 1. VIEWS
CREATE OR REPLACE VIEW complaint_analysis_view AS
SELECT 
    cr.report_id,
    r.name AS road_name,
    u.full_name AS reported_by_user,
    cm.version_tag AS flagged_by_ai,
    cr.reported_score,
    cr.status
FROM condition_reports cr
INNER JOIN roads r ON cr.road_id = r.road_id
LEFT JOIN users u ON cr.user_id = u.user_id
LEFT JOIN cnn_models cm ON cr.model_id = cm.model_id;

-- 2. JOINS
-- Rights JOIN demo: categories matching to roads (MySQL supports Right Join)
SELECT cc.category_name, r.name AS road_name
FROM road_conditions rc
JOIN roads r ON rc.road_id = r.road_id
RIGHT JOIN condition_categories cc ON rc.category_id = cc.category_id;

-- 3. SUBQUERIES
-- Roads below avg condition score
SELECT r.name, rc.condition_score
FROM roads r
JOIN road_conditions rc ON r.road_id = rc.road_id
WHERE rc.condition_score < (
    SELECT AVG(condition_score) FROM road_conditions
);

-- Most complained roads (Correlated Subquery style)
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
