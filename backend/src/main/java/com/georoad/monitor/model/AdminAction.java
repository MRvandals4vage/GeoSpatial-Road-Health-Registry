package com.georoad.monitor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_action")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private User admin;

    @Column(name = "report_id")
    private String reportId;

    private String actionType; // APPROVE, REJECT, OVERRIDE, DELETE
    private String previousCondition;
    private String newCondition;
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
