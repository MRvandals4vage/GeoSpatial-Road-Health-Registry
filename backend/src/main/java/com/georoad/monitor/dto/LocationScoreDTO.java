package com.georoad.monitor.dto;

public interface LocationScoreDTO {
    String getRegionName();
    Long getTotalRoads();
    Double getAvgScore();
    Double getBestScore();
    Double getWorstScore();
}
