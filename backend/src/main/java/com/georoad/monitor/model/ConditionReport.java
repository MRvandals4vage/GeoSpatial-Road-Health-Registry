package com.georoad.monitor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.Point;
import java.time.LocalDateTime;

@Entity
@Table(name = "condition_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConditionReport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String reportId;

    @ManyToOne
    @JoinColumn(name = "road_id", nullable = false)
    private Road road;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(columnDefinition = "geometry(Point, 4326)")
    private Point pointLocation;

    private String predictedCondition;
    private Double confidenceScore;
    private String userComment;
    private String imagePath;
    
    private LocalDateTime reportedAt;

    @PrePersist
    protected void onCreate() {
        reportedAt = LocalDateTime.now();
    }
}
