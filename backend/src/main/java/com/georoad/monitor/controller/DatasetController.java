package com.georoad.monitor.controller;

import com.georoad.monitor.model.ConditionReport;
import com.georoad.monitor.model.Road;
import com.georoad.monitor.model.RoadCondition;
import com.georoad.monitor.model.RoadType;
import com.georoad.monitor.repository.ConditionReportRepository;
import com.georoad.monitor.repository.RoadRepository;
import com.georoad.monitor.repository.RoadTypeRepository;
import lombok.RequiredArgsConstructor;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.LineString;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Random;

@RestController
@RequiredArgsConstructor
public class DatasetController {

    private final RoadRepository roadRepository;
    private final RoadTypeRepository roadTypeRepository;
    private final ConditionReportRepository conditionReportRepository;

    @GetMapping("/api/generate-dataset")
    public ResponseEntity<String> generateDataset() {
        if (roadRepository.count() > 0) {
            return ResponseEntity.ok("Dataset already exists. Found " + roadRepository.count() + " roads.");
        }

        Random random = new Random();
        GeometryFactory factory = new GeometryFactory();

        // Target: 100 roads
        int numRoads = 100;

        // Base coordinates for the city (Kattankulathur and Potheri areas in Chennai)
        double centerLat = 12.825;
        double centerLng = 80.035;
        double radiusX = 0.015;
        double radiusY = 0.015; 

        // 1. Create RoadTypes
        String[] types = {"HIGHWAY", "ARTERIAL", "LOCAL", "RESIDENTIAL"};
        RoadType[] roadTypes = new RoadType[types.length];
        for (int i = 0; i < types.length; i++) {
            RoadType rt = new RoadType();
            rt.setTypeName(types[i]);
            roadTypes[i] = roadTypeRepository.save(rt);
        }

        int goodCount = 0;
        int moderateCount = 0;
        int severeCount = 0;

        for (int i = 0; i < numRoads; i++) {
            RoadType type = roadTypes[random.nextInt(roadTypes.length)];

            double startLng = centerLng + (random.nextDouble() * 2 - 1) * radiusX;
            double startLat = centerLat + (random.nextDouble() * 2 - 1) * radiusY;
            
            // Length of segment 0.001 to 0.01 degrees
            double lenX = (random.nextDouble() - 0.5) * 0.01;
            double lenY = (random.nextDouble() - 0.5) * 0.01;
            double endLng = startLng + lenX;
            double endLat = startLat + lenY;

            Coordinate[] coords = new Coordinate[]{
                    new Coordinate(startLng, startLat),
                    new Coordinate(endLng, endLat)
            };
            LineString line = factory.createLineString(coords);
            line.setSRID(4326);

            Road road = new Road();
            road.setName(type.getTypeName() + " Segment " + (i + 1));
            road.setOsmId("GEN_OSM_" + i);
            road.setGeometry(line);
            road.setType(type);

            RoadCondition condition = new RoadCondition();
            condition.setRoad(road);
            
            double score = random.nextDouble() * 100;
            condition.setConditionScore(score);

            if (score > 75) {
                condition.setCategory("GOOD");
                goodCount++;
            } else if (score > 40) {
                condition.setCategory("MODERATE");
                moderateCount++;
            } else {
                condition.setCategory("SEVERE");
                severeCount++;
            }

            condition.setSource("DATASET_GEN");
            condition.setLastUpdated(LocalDateTime.now().minusDays(random.nextInt(30)));
            road.setCurrentCondition(condition);

            Road savedRoad = roadRepository.save(road);

            // 3. Generate Historical ConditionReport
            int numReports = random.nextInt(3); // 0 to 2 reports
            for (int r = 0; r < numReports; r++) {
                ConditionReport report = new ConditionReport();
                report.setRoad(savedRoad);
                report.setPointLocation(factory.createPoint(new Coordinate(startLng, startLat)));
                report.setPredictedCondition(condition.getCategory());
                report.setConfidenceScore(condition.getConditionScore() / 100.0);
                report.setStatus("APPROVED");
                report.setUserComment("Generated historical record " + r);
                report.setReportedAt(LocalDateTime.now().minusDays(random.nextInt(60) + 30));
                conditionReportRepository.save(report);
            }
        }

        return ResponseEntity.ok(String.format("Generated Dataset: %d roads (%d GOOD, %d MODERATE, %d SEVERE).", 
            numRoads, goodCount, moderateCount, severeCount));
    }
}
