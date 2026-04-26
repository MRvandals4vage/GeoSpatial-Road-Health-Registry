package com.georoad.monitor.controller;

import com.georoad.monitor.dto.ComplaintStatsDTO;
import com.georoad.monitor.dto.LocationScoreDTO;
import com.georoad.monitor.dto.SevereRoadDTO;
import com.georoad.monitor.service.DbmsLabService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dbms-demo")
@RequiredArgsConstructor
public class DbmsLabController {

    private final DbmsLabService dbmsLabService;

    @GetMapping("/stats/general")
    public ResponseEntity<ComplaintStatsDTO> getGeneralStats() {
        return ResponseEntity.ok(dbmsLabService.getGeneralStats());
    }

    @GetMapping("/analytics/location-scores")
    public ResponseEntity<List<LocationScoreDTO>> getLocationScores() {
        return ResponseEntity.ok(dbmsLabService.getLocationScores());
    }

    @GetMapping("/alerts/union-alerts")
    public ResponseEntity<List<SevereRoadDTO>> getUnionAlerts() {
        return ResponseEntity.ok(dbmsLabService.getUnionAlerts());
    }

    @GetMapping("/views/severe-alerts")
    public ResponseEntity<List<Object[]>> getSevereRoadAlerts() {
        return ResponseEntity.ok(dbmsLabService.getSevereRoadAlerts());
    }

    @GetMapping("/analytics/most-complained")
    public ResponseEntity<List<Object[]>> getMostComplainedRoads() {
        return ResponseEntity.ok(dbmsLabService.getMostComplainedRoads());
    }

    @GetMapping("/functions/avg-score/{locId}")
    public ResponseEntity<Double> getAvgScoreFunc(@PathVariable String locId) {
        return ResponseEntity.ok(dbmsLabService.callAvgScoreFunction(locId));
    }

    @PostMapping("/procedures/safe-insert")
    public ResponseEntity<String> safeInsertReport(@RequestBody Map<String, Object> payload) {
        String roadId = (String) payload.get("roadId");
        String userId = (String) payload.get("userId");
        Double score = Double.valueOf(payload.get("score").toString());
        String comment = (String) payload.get("comment");
        
        try {
            dbmsLabService.callSafeInsertProcedure(roadId, userId, score, comment);
            return ResponseEntity.ok("Successfully executed safe insert procedure.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Exception: " + e.getMessage());
        }
    }

    @PostMapping("/procedures/generate-notices")
    public ResponseEntity<String> generateNoticesCursor() {
        try {
            dbmsLabService.callGenerateNoticesCursor();
            return ResponseEntity.ok("Cursor execution triggered for severe notices.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Exception: " + e.getMessage());
        }
    }
}
