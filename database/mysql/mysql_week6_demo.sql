

DELIMITER //

-- 1. PROCEDURE WITH EXCEPTION HANDLING (Safe Insert)
CREATE PROCEDURE safe_insert_report(
    IN p_id VARCHAR(36),
    IN p_road_id VARCHAR(36),
    IN p_user_id VARCHAR(36),
    IN p_score DECIMAL(5,2),
    IN p_comment TEXT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        SELECT 'Error: Insert failed. Rolling back.' AS ErrorMessage;
        ROLLBACK;
    END;

    START TRANSACTION;
    
    IF p_score < 0 OR p_score > 100 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Invalid score: Must be between 0 and 100';
    END IF;

    INSERT INTO condition_reports (report_id, road_id, user_id, reported_score, user_comment, status)
    VALUES (p_id, p_road_id, p_user_id, p_score, p_comment, 'PENDING');
    
    COMMIT;
END //


-- 2. CURSOR
-- Scan severe roads
CREATE PROCEDURE generate_severe_notices()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE r_name VARCHAR(255);
    DECLARE r_score DECIMAL(5,2);
    
    DECLARE severe_cursor CURSOR FOR 
        SELECT r.name, rc.condition_score
        FROM roads r
        JOIN road_conditions rc ON r.road_id = rc.road_id
        WHERE rc.condition_score < 40;
        
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN severe_cursor;
    
    read_loop: LOOP
        FETCH severe_cursor INTO r_name, r_score;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        -- MySQL doesn't have RAISE NOTICE, we'd normally insert into a logs table here
        -- Ex: INSERT INTO app_logs (msg) VALUES (CONCAT('Notice: ', r_name, ' is severe!'));
    END LOOP;
    
    CLOSE severe_cursor;
END //

-- 3. TRIGGER
CREATE TRIGGER trg_after_report_insert
AFTER INSERT ON condition_reports
FOR EACH ROW
BEGIN
    -- Simplified trigger: For demonstration of syntax differences.
    -- (Postgres recalculates dynamically as an UPSERT. 
    -- MySQL doesn't easily do upsert in triggers without duplicating complex logic).
    
    DECLARE current_count INT;
    SELECT COUNT(*) INTO current_count FROM road_conditions WHERE road_id = NEW.road_id;
    
    IF current_count = 0 THEN
        INSERT INTO road_conditions (condition_id, road_id, condition_score, category_id)
        VALUES (UUID(), NEW.road_id, NEW.reported_score, NULL);
    END IF;
END //

DELIMITER ;
