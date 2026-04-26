
-- 1. Total complaints versus total severe complaints
SELECT 
    COUNT(*) AS total_complaints,
    SUM(CASE WHEN reported_score < 40 THEN 1 ELSE 0 END) AS total_severe_complaints
FROM condition_reports;

-- 2. Average condition score, Highest, Lowest by Location
SELECT 
    l.region_name,
    COUNT(r.road_id) AS total_roads,
    ROUND(AVG(rc.condition_score), 2) AS avg_score,
    MAX(rc.condition_score) AS best_score,
    MIN(rc.condition_score) AS worst_score
FROM locations l
JOIN roads r ON l.location_id = r.location_id
JOIN road_conditions rc ON r.road_id = rc.road_id
GROUP BY l.region_name
HAVING COUNT(r.road_id) > 0
ORDER BY avg_score ASC;

-- 3. Set Ops: UNION
-- Roads reported by users UNION roads flagged severe by AI
SELECT r.road_id, r.name, 'Reported by User' AS alert_reason
FROM roads r
JOIN condition_reports cr ON r.road_id = cr.road_id
WHERE cr.user_id IS NOT NULL
UNION
SELECT r.road_id, r.name, 'AI Flagged Severe' AS alert_reason
FROM roads r
JOIN condition_reports cr ON r.road_id = cr.road_id
WHERE cr.model_id IS NOT NULL AND cr.reported_score < 40;

-- 4. Emulated INTERSECT in MySQL (Road category SEVERE AND unresolved complaints > 3)
SELECT r.road_id, r.name
FROM roads r
JOIN road_conditions rc ON r.road_id = rc.road_id
JOIN condition_categories cc ON rc.category_id = cc.category_id
WHERE cc.category_name = 'SEVERE'
AND r.road_id IN (
    SELECT cr.road_id
    FROM condition_reports cr
    WHERE cr.status = 'PENDING'
    GROUP BY cr.road_id
    HAVING COUNT(cr.report_id) > 3
);

-- 5. Emulated EXCEPT in MySQL (Pending reports MINUS those already having admin action)
SELECT cr.report_id, cr.road_id
FROM condition_reports cr
LEFT JOIN admin_actions aa ON cr.report_id = aa.report_id
WHERE cr.status = 'PENDING' AND aa.action_id IS NULL;
