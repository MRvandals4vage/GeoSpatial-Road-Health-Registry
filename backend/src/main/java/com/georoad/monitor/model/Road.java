package com.georoad.monitor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.locationtech.jts.geom.LineString;

@Entity
@Table(name = "roads")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Road {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String roadId;

    private String osmId;
    private String name;

    @Column(columnDefinition = "geometry(LineString, 4326)")
    private LineString geometry;

    @ManyToOne
    @JoinColumn(name = "type_id")
    private RoadType type;

    @OneToOne(mappedBy = "road", cascade = CascadeType.ALL)
    private RoadCondition currentCondition;
}
