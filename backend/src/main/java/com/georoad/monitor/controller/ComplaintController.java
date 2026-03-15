package com.georoad.monitor.controller;

import com.georoad.monitor.model.ConditionReport;
import com.georoad.monitor.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {
    private final ComplaintService complaintService;

    @PostMapping
    public ResponseEntity<ConditionReport> submitComplaint(
            @RequestParam(value = "roadId", required = false) String roadId,
            @RequestParam(value = "userId", required = false) String userId,
            @RequestParam(value = "comment", required = false) String comment,
            @RequestParam("latitude") Double lat,
            @RequestParam("longitude") Double lng,
            @RequestParam("image") MultipartFile image) {
        
        return ResponseEntity.ok(complaintService.processComplaint(roadId, userId, comment, lat, lng, image));
    }

    @GetMapping
    public ResponseEntity<List<ConditionReport>> getAllComplaints() {
        return ResponseEntity.ok(complaintService.findAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComplaint(@PathVariable String id) {
        complaintService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
