-- =========================================================================
-- GeoRoad DBMS Lab Demonstration: Week 6
-- Functions, Triggers, Cursors, and Exception Handling
-- =========================================================================

DELIMITER //

-- ----------------------------------------------------
-- 1. Functions
-- ----------------------------------------------------

-- A. Average condition score by location ID
DROP FUNCTION IF EXISTS GetAverageScoreByLocation //
CREATE FUNCTION GetAverageScoreByLocation(loc_id INT) 
RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
    DECLARE avg_score DECIMAL(5,2);
    
    SELECT AVG(rc.current_score) INTO avg_score 
    FROM ROAD r
    JOIN ROAD_CONDITION rc ON r.road_id = rc.road_id
    WHERE r.location_id = loc_id;
    
    -- If no data found, return NULL
    RETURN avg_score;
END //

-- B. Total complaint count by region string (User complaints, not AI)
DROP FUNCTION IF EXISTS GetComplaintCountByRegion //
CREATE FUNCTION GetComplaintCountByRegion(region_val VARCHAR(200)) 
RETURNS INT
DETERMINISTIC
BEGIN
    DECLARE complain_count INT;
    
    SELECT COUNT(cr.report_id) INTO complain_count 
    FROM CONDITION_REPORT cr
    JOIN ROAD r ON cr.road_id = r.road_id
    JOIN LOCATION l ON r.location_id = l.location_id
    WHERE l.region_name = region_val AND cr.is_ai_generated = FALSE;
    
    RETURN IFNULL(complain_count, 0);
END //


-- ----------------------------------------------------
-- 2. Triggers
-- ----------------------------------------------------

-- Trigger: Automatically update ROAD_CONDITION when a new report is filed
-- Requirement: Whenever a new CONDITION_REPORT is inserted, ROAD_CONDITION is updated.
DROP TRIGGER IF EXISTS trg_after_report_insert //
CREATE TRIGGER trg_after_report_insert 
AFTER INSERT ON CONDITION_REPORT
FOR EACH ROW
BEGIN
    -- Check if the road already has a condition recorded
    IF EXISTS (SELECT 1 FROM ROAD_CONDITION WHERE road_id = NEW.road_id) THEN
        -- If it exists, update it based on the latest report score
        UPDATE ROAD_CONDITION 
        SET current_score = NEW.score,
            last_updated = CURRENT_TIMESTAMP
        WHERE road_id = NEW.road_id;
    ELSE
        -- If it doesn't exist yet, insert a new record
        INSERT INTO ROAD_CONDITION (road_id, current_score) 
        VALUES (NEW.road_id, NEW.score);
    END IF;
END //


-- ----------------------------------------------------
-- 3. Cursors
-- ----------------------------------------------------

-- Procedure using cursor for admin batch processing of severe roads
-- Requirement: Scan all severe roads (score >= 80) and log an "INSPECTION_REQUIRED" admin action
DROP PROCEDURE IF EXISTS ScanSevereRoadsAndLogAction //
CREATE PROCEDURE ScanSevereRoadsAndLogAction(IN p_admin_id INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE cur_road_id INT;
    DECLARE cur_report_id INT;
    
    -- Find the latest report for each severe road condition
    DECLARE severe_cursor CURSOR FOR 
        SELECT rc.road_id, 
               (SELECT MAX(report_id) FROM CONDITION_REPORT cr WHERE cr.road_id = rc.road_id) AS latest_report
        FROM ROAD_CONDITION rc
        WHERE rc.current_score >= 80;
        
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN severe_cursor;
    
    read_loop: LOOP
        FETCH severe_cursor INTO cur_road_id, cur_report_id;
        
        IF done THEN 
            LEAVE read_loop; 
        END IF;

        -- Create an automated admin action for each severe road using the latest report reference
        INSERT INTO ADMIN_ACTION (admin_id, report_id, action_type)
        VALUES (p_admin_id, cur_report_id, 'AUTO_INSPECTION_REQUIRED');
        
    END LOOP;
    
    CLOSE severe_cursor;
END //


-- ----------------------------------------------------
-- 4. Exception Handling
-- ----------------------------------------------------

-- Procedure to safely insert a new report with exception handling for FK failures
-- Requirement: Safe insert, handling invalid foreign key cases (e.g. invalid road_id or user_id)
DROP PROCEDURE IF EXISTS SafeInsertConditionReport //
CREATE PROCEDURE SafeInsertConditionReport(
    IN p_road_id INT, 
    IN p_user_id INT, 
    IN p_score INT, 
    IN p_is_ai BOOLEAN,
    OUT p_status_msg VARCHAR(255)
)
BEGIN
    -- Declare handlers for duplicate keys or foreign key violations
    -- ER_NO_REFERENCED_ROW_2 code 1452 refers to missing foreign key
    DECLARE CONTINUE HANDLER FOR 1452
    BEGIN
        SET p_status_msg = 'ERROR: Invalid Foreign Key referencing active ROAD or USERS.';
    END;

    -- General SQL exception catcher for CHECK constraints or other errors
    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        SET p_status_msg = 'ERROR: Internal DB constraint failed or unknown SQL Error.';
    END;

    -- Initialize message to SUCCESS
    SET p_status_msg = 'SUCCESS: Report Inserted.';

    -- Attempt to execute the insert statement
    INSERT INTO CONDITION_REPORT (road_id, user_id, score, is_ai_generated) 
    VALUES (p_road_id, p_user_id, p_score, p_is_ai);
    
END //

DELIMITER ;
