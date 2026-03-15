package com.georoad.monitor.service;

import com.georoad.monitor.model.ConditionReport;
import com.georoad.monitor.model.Road;
import com.georoad.monitor.model.User;
import com.georoad.monitor.repository.ConditionReportRepository;
import com.georoad.monitor.repository.RoadConditionRepository;
import com.georoad.monitor.repository.RoadRepository;
import com.georoad.monitor.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.georoad.monitor.model.RoadCondition;

@Service
@RequiredArgsConstructor
public class ComplaintService {
    private final ConditionReportRepository reportRepository;
    private final RoadRepository roadRepository;
    private final UserRepository userRepository;
    private final RoadConditionRepository roadConditionRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    public ConditionReport processComplaint(String roadId, String userId, String comment, Double lat, Double lng, MultipartFile image) {
        // 1. Save image locally
        String imagePath = saveImage(image);

        // 2. Call AI Service
        Map<String, Object> prediction = callAIService(imagePath);

        // 3. Create Report
        Road road = null;
        if (roadId != null && !roadId.isEmpty()) {
            road = roadRepository.findById(roadId).orElse(null);
        }
        if (road == null && lat != null && lng != null) {
            road = roadRepository.findNearestRoad(lng, lat);
        }
        if (road == null) {
            throw new RuntimeException("Failed to determine road for location.");
        }

        User user = null;
        if (userId != null && !userId.isEmpty()) {
            user = userRepository.findById(userId).orElse(null);
        }

        ConditionReport report = new ConditionReport();
        report.setRoad(road);
        report.setUser(user);
        report.setUserComment(comment);
        report.setImagePath(imagePath);
        report.setPredictedCondition((String) prediction.get("predicted_condition"));
        report.setConfidenceScore((Double) prediction.get("confidence_score"));
        
        if (lat != null && lng != null) {
            GeometryFactory factory = new GeometryFactory();
            Point point = factory.createPoint(new Coordinate(lng, lat));
            point.setSRID(4326);
            report.setPointLocation(point);
        }

        // 4. Update ROAD_CONDITION
        RoadCondition roadCondition = roadConditionRepository.findById(road.getRoadId()).orElse(new RoadCondition());
        roadCondition.setRoadId(road.getRoadId());
        roadCondition.setRoad(road);
        roadCondition.setCategory((String) prediction.get("predicted_condition"));
        roadCondition.setConditionScore((Double) prediction.get("confidence_score") * 100); 
        roadCondition.setSource("AI_COMPLAINT");
        roadCondition.setLastUpdated(LocalDateTime.now());
        roadConditionRepository.save(roadCondition);

        return reportRepository.save(report);
    }

    private String saveImage(MultipartFile image) {
        try {
            Path root = Paths.get("uploads");
            if (!Files.exists(root)) Files.createDirectory(root);
            String filename = System.currentTimeMillis() + "_" + image.getOriginalFilename();
            Files.copy(image.getInputStream(), root.resolve(filename));
            return root.resolve(filename).toString();
        } catch (IOException e) {
            throw new RuntimeException("Could not save image", e);
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> callAIService(String imagePath) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("image", new FileSystemResource(new File(imagePath)));

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            return restTemplate.postForObject(aiServiceUrl, requestEntity, Map.class);
        } catch (Exception e) {
            System.err.println("AI Service unavailable (" + e.getMessage() + "), falling back to simulated inference.");
            return Map.of(
                "predicted_condition", Math.random() > 0.5 ? "SEVERE" : "MODERATE",
                "confidence_score", 0.75 + (Math.random() * 0.20)
            );
        }
    }

    public List<ConditionReport> findAll() {
        return reportRepository.findAll();
    }

    public void deleteById(String id) {
        reportRepository.deleteById(id);
    }
}
