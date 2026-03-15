package com.georoad.monitor.repository;

import com.georoad.monitor.model.RoadCondition;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoadConditionRepository extends JpaRepository<RoadCondition, String> {
}
