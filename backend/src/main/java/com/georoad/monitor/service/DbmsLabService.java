package com.georoad.monitor.service;

import com.georoad.monitor.dto.ComplaintStatsDTO;
import com.georoad.monitor.dto.LocationScoreDTO;
import com.georoad.monitor.dto.SevereRoadDTO;
import com.georoad.monitor.repository.DbmsLabRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DbmsLabService {

    private final DbmsLabRepository dbmsLabRepository;

    public ComplaintStatsDTO getGeneralStats() {
        return dbmsLabRepository.getGeneralComplaintStats();
    }

    public List<LocationScoreDTO> getLocationScores() {
        return dbmsLabRepository.getLocationScores();
    }

    public List<SevereRoadDTO> getUnionAlerts() {
        return dbmsLabRepository.getUnionAlerts();
    }

    public List<Object[]> getSevereRoadAlerts() {
        return dbmsLabRepository.getSevereRoadAlertsFromView();
    }

    public List<Object[]> getMostComplainedRoads() {
        return dbmsLabRepository.getMostComplainedRoads();
    }

    public Double callAvgScoreFunction(String locId) {
        return dbmsLabRepository.getAverageScoreByLocationFunc(locId);
    }
    
    public void callSafeInsertProcedure(String roadId, String userId, Double score, String comment) {
        dbmsLabRepository.safeInsertReport(roadId, userId, score, comment);
    }

    public void callGenerateNoticesCursor() {
        dbmsLabRepository.generateSevereRoadNotices();
    }
}
