package com.georoad.monitor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "road_conditions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadCondition {
    @Id
    private String roadId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "road_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Road road;

    private String category;
    private Double conditionScore;
    private String source;
    private LocalDateTime lastUpdated;
}
