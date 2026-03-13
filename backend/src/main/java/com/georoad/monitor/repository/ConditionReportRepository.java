package com.georoad.monitor.repository;

import com.georoad.monitor.model.ConditionReport;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConditionReportRepository extends JpaRepository<ConditionReport, String> {
}
