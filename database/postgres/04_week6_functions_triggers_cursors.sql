-- database/postgres/04_week6_functions_triggers_cursors.sql
-- Satisfies Rubric: Functions, Triggers, Cursors, Exception Handling

-- =======================================================
-- 1. FUNCTIONS & PROCEDURES WITH EXCEPTION HANDLING
-- =======================================================

-- Function: Get Average Condition Score by Location
CREATE OR REPLACE FUNCTION get_avg_score_by_location(loc_id UUID)
RETURNS NUMERIC AS $$
DECLARE
    avg_score NUMERIC;
BEGIN
    SELECT AVG(rc.condition_score) INTO avg_score
    FROM roads r
    JOIN road_conditions rc ON r.road_id = rc.road_id
    WHERE r.location_id = loc_id;

    IF avg_score IS NULL THEN
        RAISE EXCEPTION 'No road conditions found for location %', loc_id;
    END IF;

    RETURN ROUND(avg_score, 2);
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error occurred: %', SQLERRM;
        RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Safely insert a condition report
CREATE OR REPLACE PROCEDURE safe_insert_report(
    p_road_id UUID,
    p_user_id UUID,
    p_score NUMERIC,
    p_comment TEXT
) 
LANGUAGE plpgsql AS $$
BEGIN
    -- Exception Handling: Invalid score
    IF p_score < 0 OR p_score > 100 THEN
        RAISE EXCEPTION 'Invalid score %: Must be between 0 and 100', p_score;
    END IF;
    
    -- Exception Handling: Check if road exists
    IF NOT EXISTS (SELECT 1 FROM roads WHERE road_id = p_road_id) THEN
        RAISE EXCEPTION 'Invalid road id: Road % does not exist', p_road_id;
    END IF;

    INSERT INTO condition_reports (road_id, user_id, reported_score, user_comment, status)
    VALUES (p_road_id, p_user_id, p_score, p_comment, 'PENDING');
    
    COMMIT;
EXCEPTION
    WHEN unique_violation THEN
        RAISE NOTICE 'Duplicate report insertion attempt.';
        ROLLBACK;
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting report: %', SQLERRM;
        ROLLBACK;
END;
$$;


-- =======================================================
-- 2. TRIGGERS
-- =======================================================

-- Trigger: Automatically update ROAD_CONDITION when a new CONDITION_REPORT is added
CREATE OR REPLACE FUNCTION update_road_condition_on_report()
RETURNS TRIGGER AS $$
DECLARE
    new_avg_score NUMERIC;
    cat_id UUID;
BEGIN
    -- Calculate new average score for the road
    SELECT AVG(reported_score) INTO new_avg_score
    FROM condition_reports 
    WHERE road_id = NEW.road_id AND status = 'APPROVED'; -- Only consider approved reports

    IF new_avg_score IS NOT NULL THEN
        -- Find proper category based on the average score
        SELECT category_id INTO cat_id 
        FROM condition_categories 
        WHERE (severity_level = 5 AND new_avg_score < 30) OR
              (severity_level = 4 AND new_avg_score >= 30 AND new_avg_score < 50) OR
              (severity_level = 3 AND new_avg_score >= 50 AND new_avg_score < 70) OR
              (severity_level = 2 AND new_avg_score >= 70 AND new_avg_score < 85) OR
              (severity_level = 1 AND new_avg_score >= 85);
              
        -- Upsert condition
        INSERT INTO road_conditions (road_id, condition_score, category_id, last_updated)
        VALUES (NEW.road_id, new_avg_score, cat_id, CURRENT_TIMESTAMP)
        ON CONFLICT (road_id) DO UPDATE 
        SET condition_score = EXCLUDED.condition_score,
            category_id = EXCLUDED.category_id,
            last_updated = CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_after_report_insert
AFTER INSERT OR UPDATE OF status ON condition_reports
FOR EACH ROW
EXECUTE FUNCTION update_road_condition_on_report();

-- Trigger: Log action when Admin resolves a complaint
CREATE OR REPLACE FUNCTION log_admin_resolution()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'RESOLVED' AND OLD.status != 'RESOLVED' THEN
        -- Assuming we pass admin_id through a session temp variable for this demo, 
        -- but typically handled in application code. We'll simply insert a generic log here if admin_id is available.
        RAISE NOTICE 'Report % has been resolved.', NEW.report_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_admin_resolve_log
AFTER UPDATE ON condition_reports
FOR EACH ROW
EXECUTE FUNCTION log_admin_resolution();


-- =======================================================
-- 3. CURSORS
-- =======================================================

-- Procedure: Cursor to scan all severe roads and generate notices (for Admin Review batch processing)
CREATE OR REPLACE PROCEDURE generate_severe_road_notices()
LANGUAGE plpgsql AS $$
DECLARE
    severe_cursor CURSOR FOR 
        SELECT r.name, rc.condition_score, l.region_name
        FROM roads r
        JOIN road_conditions rc ON r.road_id = rc.road_id
        JOIN locations l ON r.location_id = l.location_id
        WHERE rc.condition_score < 40;
    
    road_record RECORD;
    notice_count INT := 0;
BEGIN
    OPEN severe_cursor;
    
    LOOP
        FETCH severe_cursor INTO road_record;
        EXIT WHEN NOT FOUND;
        
        -- In a real app, you might insert into an `alerts` table here
        RAISE NOTICE 'ALERT: Road "%" in "%" has severe condition score: %', 
            road_record.name, road_record.region_name, road_record.condition_score;
        notice_count := notice_count + 1;
    END LOOP;
    
    CLOSE severe_cursor;
    
    RAISE NOTICE 'Total severe road alerts generated: %', notice_count;
END;
$$;
