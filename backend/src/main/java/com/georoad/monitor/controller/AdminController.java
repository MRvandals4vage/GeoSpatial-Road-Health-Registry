package com.georoad.monitor.controller;

import com.georoad.monitor.model.AdminAction;
import com.georoad.monitor.model.ConditionReport;
import com.georoad.monitor.repository.AdminActionRepository;
import com.georoad.monitor.repository.ConditionReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ConditionReportRepository conditionReportRepository;
    private final AdminActionRepository adminActionRepository;

    @PostMapping("/complaints/{id}/approve")
    public ResponseEntity<?> approveComplaint(@PathVariable String id) {
        return handleAction(id, "APPROVE", null);
    }

    @PostMapping("/complaints/{id}/reject")
    public ResponseEntity<?> rejectComplaint(@PathVariable String id) {
        return handleAction(id, "REJECT", null);
    }

    @PostMapping("/complaints/{id}/override")
    public ResponseEntity<?> overrideComplaint(@PathVariable String id, @RequestParam String newCondition) {
        return handleAction(id, "OVERRIDE", newCondition);
    }

    @DeleteMapping("/complaints/{id}")
    public ResponseEntity<?> deleteComplaint(@PathVariable String id) {
        Optional<ConditionReport> opt = conditionReportRepository.findById(id);
        if (opt.isPresent()) {
            AdminAction action = AdminAction.builder()
                .reportId(opt.get().getReportId())
                .actionType("DELETE")
                .previousCondition(opt.get().getPredictedCondition())
                .build();
            adminActionRepository.save(action);
            conditionReportRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    private ResponseEntity<?> handleAction(String id, String actionType, String newCondition) {
        Optional<ConditionReport> opt = conditionReportRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        ConditionReport report = opt.get();
        
        AdminAction action = AdminAction.builder()
            .reportId(report.getReportId())
            .actionType(actionType)
            .previousCondition(report.getPredictedCondition())
            .build();

        if ("APPROVE".equals(actionType)) {
            report.setStatus("APPROVED");
        } else if ("REJECT".equals(actionType)) {
            report.setStatus("REJECTED");
        } else if ("OVERRIDE".equals(actionType)) {
            report.setStatus("APPROVED");
            report.setPredictedCondition(newCondition);
            action.setNewCondition(newCondition);
        }
        
        conditionReportRepository.save(report);
        adminActionRepository.save(action);
        return ResponseEntity.ok(report);
    }
}
