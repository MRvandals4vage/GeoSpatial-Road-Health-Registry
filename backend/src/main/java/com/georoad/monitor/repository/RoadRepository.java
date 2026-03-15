package com.georoad.monitor.repository;

import com.georoad.monitor.model.Road;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RoadRepository extends JpaRepository<Road, String> {

    @Query(value = "SELECT * FROM roads ORDER BY ST_Distance(geometry, ST_SetSRID(ST_Point(:lng, :lat), 4326)) LIMIT 1", nativeQuery = true)
    Road findNearestRoad(@Param("lng") Double lng, @Param("lat") Double lat);

    @Query(value = "SELECT * FROM roads WHERE ST_Intersects(geometry, ST_MakeEnvelope(:xmin, :ymin, :xmax, :ymax, 4326))", nativeQuery = true)
    List<Road> findRoadsInBoundingBox(@Param("xmin") Double xmin, @Param("ymin") Double ymin, @Param("xmax") Double xmax, @Param("ymax") Double ymax);
}
