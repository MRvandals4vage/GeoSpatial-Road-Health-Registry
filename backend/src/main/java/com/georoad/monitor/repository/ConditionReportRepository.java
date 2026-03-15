package com.georoad.monitor.repository;

import com.georoad.monitor.model.ConditionReport;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConditionReportRepository extends JpaRepository<ConditionReport, String> {
    List<ConditionReport> findByRoad_RoadIdOrderByReportedAtDesc(String roadId);
}
