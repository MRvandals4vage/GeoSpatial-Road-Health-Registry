package com.georoad.monitor.repository;

import com.georoad.monitor.model.Road;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoadRepository extends JpaRepository<Road, String> {
}
