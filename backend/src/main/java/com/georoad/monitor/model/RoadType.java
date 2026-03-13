package com.georoad.monitor.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "road_types")
@Data
public class RoadType {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String typeId;

    private String typeName;
}
