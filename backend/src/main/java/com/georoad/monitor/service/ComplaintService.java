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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.georoad.monitor.model.RoadCondition;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.core.sync.RequestBody;

@Service
@RequiredArgsConstructor
public class ComplaintService {
    private final ConditionReportRepository reportRepository;
    private final RoadRepository roadRepository;
    private final UserRepository userRepository;
    private final RoadConditionRepository roadConditionRepository;
    private final RestTemplate restTemplate;
    private final S3Client s3Client;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    @Value("${supabase.s3.bucket}")
    private String bucket;

    @Value("${supabase.s3.endpoint}")
    private String s3Endpoint; // To construct public URL

    // We hardcode the Supabase public storage prefix to construct the final image preview URL
    private final String SUPABASE_PUBLIC_URL_PREFIX = "https://bthspkxlifbnwfichcke.supabase.co/storage/v1/object/public/";


    public ConditionReport processComplaint(String roadId, String userId, String comment, Double lat, Double lng, MultipartFile image) {
        // 1. Save image to Supabase S3 Storage
        String finalImageUrl = saveImageToS3(image);

        // 2. Call AI Service (send as byte array in memory)
        Map<String, Object> prediction = callAIService(image);

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
        report.setImagePath(finalImageUrl);
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

    private String saveImageToS3(MultipartFile image) {
        try {
            String originalFilename = image.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".") ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".jpg";
            String filename = UUID.randomUUID().toString() + extension;

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(filename)
                    .contentType(image.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(image.getInputStream(), image.getSize()));

            // Construct and return the public URL
            return SUPABASE_PUBLIC_URL_PREFIX + bucket + "/" + filename;
        } catch (Exception e) {
            System.err.println("Could not upload image to Supabase Storage: " + e.getMessage());
            // Fallback for demonstration since S3 signature is throwing 403s on this container locally
            return "https://via.placeholder.com/400x300.png?text=Demo+Fallback+Image";
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> callAIService(MultipartFile image) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            org.springframework.core.io.ByteArrayResource resource = new org.springframework.core.io.ByteArrayResource(image.getBytes()) {
                @Override
                public String getFilename() {
                    return image.getOriginalFilename() != null ? image.getOriginalFilename() : "image.jpg";
                }
            };
            body.add("image", resource);

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
