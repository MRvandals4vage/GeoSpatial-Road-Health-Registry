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

    @com.fasterxml.jackson.annotation.JsonIgnore
    @Column(columnDefinition = "geometry(LineString, 4326)")
    private LineString geometry;

    @com.fasterxml.jackson.annotation.JsonIgnore
    public LineString getGeometry() {
        return this.geometry;
    }

    @com.fasterxml.jackson.annotation.JsonGetter("coordinates")
    public double[][] getCoordinates() {
        if (geometry == null) return null;
        org.locationtech.jts.geom.Coordinate[] coords = geometry.getCoordinates();
        double[][] points = new double[coords.length][2];
        for (int i=0; i<coords.length; i++) {
            points[i][0] = coords[i].x;
            points[i][1] = coords[i].y;
        }
        return points;
    }
    @ManyToOne
    @JoinColumn(name = "type_id")
    private RoadType type;

    @OneToOne(mappedBy = "road", cascade = CascadeType.ALL)
    private RoadCondition currentCondition;
}
