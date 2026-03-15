package com.georoad.monitor.controller;

import com.georoad.monitor.model.Road;
import com.georoad.monitor.repository.RoadRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.georoad.monitor.model.ConditionReport;
import com.georoad.monitor.repository.ConditionReportRepository;
import java.util.List;

@RestController
@RequestMapping("/api/roads")
@RequiredArgsConstructor
public class RoadController {
    private final RoadRepository roadRepository;
    private final ConditionReportRepository conditionReportRepository;

    @GetMapping
    public ResponseEntity<List<Road>> getRoads(@RequestParam(required = false) String bbox) {
        if (bbox != null) {
            String[] coords = bbox.split(",");
            if (coords.length == 4) {
                try {
                    double xmin = Double.parseDouble(coords[0]);
                    double ymin = Double.parseDouble(coords[1]);
                    double xmax = Double.parseDouble(coords[2]);
                    double ymax = Double.parseDouble(coords[3]);
                    return ResponseEntity.ok(roadRepository.findRoadsInBoundingBox(xmin, ymin, xmax, ymax));
                } catch (NumberFormatException e) {
                    // Ignore bad bounding box, fallback to findAll
                }
            }
        }
        return ResponseEntity.ok(roadRepository.findAll());
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<ConditionReport>> getRoadHistory(@PathVariable String id) {
        return ResponseEntity.ok(conditionReportRepository.findByRoad_RoadIdOrderByReportedAtDesc(id));
    }
}
