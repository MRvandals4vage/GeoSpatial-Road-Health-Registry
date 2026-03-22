-- =========================================================================
-- GeoRoad DBMS Lab Demonstration: Week 4
-- Aggregate Functions, Constraints, and Set Operations
-- =========================================================================

-- ----------------------------------------------------
-- 1. Aggregate Queries
-- ----------------------------------------------------

-- A. Total Complaints (Count of all reports)
SELECT COUNT(*) AS total_complaints 
FROM CONDITION_REPORT;

-- B. Average Condition Score by Location
-- Joins ROAD to trace reports to their respective locations
SELECT l.region_name, AVG(cr.score) AS average_condition_score
FROM LOCATION l
JOIN ROAD r ON l.location_id = r.location_id
JOIN CONDITION_REPORT cr ON r.road_id = cr.road_id
GROUP BY l.region_name;

-- C. Severe Roads Count (Score >= 80, assuming 100 is worst)
SELECT COUNT(DISTINCT road_id) AS severe_roads_count
FROM ROAD_CONDITION
WHERE current_score >= 80;

-- D. Max/Min Condition Score across all roads
SELECT 
    MAX(current_score) AS max_score, 
    MIN(current_score) AS min_score
FROM ROAD_CONDITION;


-- ----------------------------------------------------
-- 2. Constraints Demonstration
-- ----------------------------------------------------
-- Constraints (PK, FK, CHECK, UNIQUE, NOT NULL) are created in 01_mysql_schema.sql.
-- Here are queries proving the constraint validations:

-- Demonstration: CHECK constraint for condition_score (0-100)
-- This will fail because score is > 100:
-- INSERT INTO CONDITION_REPORT (road_id, score, is_ai_generated) VALUES (1, 150, FALSE);

-- Demonstration: UNIQUE email
-- The second insert will fail due to duplicate email:
-- INSERT INTO USERS (username, email, password_hash, user_role) VALUES ('Alice', 'alice@georoad.org', 'hash', 'USER');
-- INSERT INTO USERS (username, email, password_hash, user_role) VALUES ('Bob', 'alice@georoad.org', 'hash', 'USER');

-- Demonstration: FOREIGN KEY
-- This will fail if location_id 99999 does not exist:
-- INSERT INTO ROAD (name, location_id, route) VALUES ('Fake Road', 99999, ST_GeomFromText('LINESTRING(0 0, 1 1)', 4326));


-- ----------------------------------------------------
-- 3. Set Operations (UNION, INTERSECT, EXCEPT)
-- ----------------------------------------------------

-- A. UNION: Combine all user-submitted and AI-generated report IDs for a complete view
SELECT report_id, 'USER_SUBMITTED' AS source
FROM CONDITION_REPORT
WHERE is_ai_generated = FALSE
UNION
SELECT report_id, 'AI_MODEL' AS source
FROM CONDITION_REPORT
WHERE is_ai_generated = TRUE;

-- B. INTERSECT: Roads that have BOTH user-submitted complaints AND AI-generated reports
-- (Note: INTERSECT is native in MySQL 8.0.31+. Equivalent below)
SELECT road_id FROM CONDITION_REPORT WHERE is_ai_generated = TRUE
INTERSECT
SELECT road_id FROM CONDITION_REPORT WHERE is_ai_generated = FALSE;

-- Alternative for MySQL versions < 8.0.31 (Inner Join/IN):
/*
SELECT DISTINCT r1.road_id 
FROM CONDITION_REPORT r1
WHERE r1.is_ai_generated = TRUE 
AND r1.road_id IN (
    SELECT road_id FROM CONDITION_REPORT WHERE is_ai_generated = FALSE
);
*/

-- C. EXCEPT: Roads that have ONLY user-submitted complaints (No AI generated reports)
-- (Note: EXCEPT is native in MySQL 8.0.31+. Equivalent below)
SELECT road_id FROM CONDITION_REPORT WHERE is_ai_generated = FALSE
EXCEPT
SELECT road_id FROM CONDITION_REPORT WHERE is_ai_generated = TRUE;

-- Alternative for MySQL versions < 8.0.31 (NOT IN):
/*
SELECT DISTINCT road_id 
FROM CONDITION_REPORT 
WHERE is_ai_generated = FALSE 
AND road_id NOT IN (
    SELECT road_id FROM CONDITION_REPORT WHERE is_ai_generated = TRUE
);
*/
