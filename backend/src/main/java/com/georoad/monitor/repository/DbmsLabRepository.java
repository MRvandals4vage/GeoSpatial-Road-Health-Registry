package com.georoad.monitor.repository;

import com.georoad.monitor.dto.ComplaintStatsDTO;
import com.georoad.monitor.dto.LocationScoreDTO;
import com.georoad.monitor.dto.SevereRoadDTO;
import com.georoad.monitor.model.ConditionReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DbmsLabRepository extends JpaRepository<ConditionReport, String> {

    // 1. Aggregates: Total vs Severe
    @Query(value = "SELECT COUNT(*) AS totalComplaints, " +
                   "SUM(CASE WHEN reported_score < 40 THEN 1 ELSE 0 END) AS totalSevereComplaints " +
                   "FROM condition_reports", nativeQuery = true)
    ComplaintStatsDTO getGeneralComplaintStats();

    // 2. Group By & Having: Avg score by location
    @Query(value = "SELECT l.region_name AS regionName, " +
                   "COUNT(r.road_id) AS totalRoads, " +
                   "ROUND(AVG(rc.condition_score), 2) AS avgScore, " +
                   "MAX(rc.condition_score) AS bestScore, " +
                   "MIN(rc.condition_score) AS worstScore " +
                   "FROM locations l " +
                   "JOIN roads r ON l.location_id = r.location_id " +
                   "JOIN road_conditions rc ON r.road_id = rc.road_id " +
                   "GROUP BY l.region_name " +
                   "HAVING COUNT(r.road_id) > 0 " +
                   "ORDER BY avgScore ASC", nativeQuery = true)
    List<LocationScoreDTO> getLocationScores();

    // 3. Set Operations (UNION)
    @Query(value = "SELECT r.road_id AS roadId, r.name AS roadName, 'Reported by User' AS alertReason " +
                   "FROM roads r JOIN condition_reports cr ON r.road_id = cr.road_id WHERE cr.user_id IS NOT NULL " +
                   "UNION " +
                   "SELECT r.road_id AS roadId, r.name AS roadName, 'AI Flagged Severe' AS alertReason " +
                   "FROM roads r JOIN condition_reports cr ON r.road_id = cr.road_id " +
                   "WHERE cr.model_id IS NOT NULL AND cr.reported_score < 40", nativeQuery = true)
    List<SevereRoadDTO> getUnionAlerts();

    // 4. View Usage (Subqueries & Views implicitly tested if we query the view)
    @Query(value = "SELECT * FROM severe_road_alert_view", nativeQuery = true)
    List<Object[]> getSevereRoadAlertsFromView();

    // 5. Correlated Subquery
    @Query(value = "SELECT r.name, COUNT(cr.report_id) AS num_complaints " +
                   "FROM roads r JOIN condition_reports cr ON r.road_id = cr.road_id " +
                   "GROUP BY r.road_id, r.name " +
                   "HAVING COUNT(cr.report_id) > ( " +
                   "   SELECT AVG(complaint_count) FROM ( " +
                   "       SELECT COUNT(report_id) AS complaint_count FROM condition_reports GROUP BY road_id " +
                   "   ) AS avg_complaints " +
                   ")", nativeQuery = true)
    List<Object[]> getMostComplainedRoads();

    // 6. DB Function (Average Score by Location)
    @Query(value = "SELECT get_avg_score_by_location(CAST(:locId AS UUID))", nativeQuery = true)
    Double getAverageScoreByLocationFunc(@Param("locId") String locationId);
    
    // 7. DB Procedure (Safe Insert)
    @Procedure(procedureName = "safe_insert_report")
    void safeInsertReport(@Param("p_road_id") String roadId, @Param("p_user_id") String userId, 
                          @Param("p_score") Double score, @Param("p_comment") String comment);

    // 8. DB Procedure (Generate Severe Notices - Cursor)
    @Procedure(procedureName = "generate_severe_road_notices")
    void generateSevereRoadNotices();
}
