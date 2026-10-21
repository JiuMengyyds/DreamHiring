package com.dreamhiring.vo;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class StatsViews {

    private StatsViews() {
    }

    public record Overview(
            long sampleCount,
            double averageSalary,
            double supplyDemandRatio,
            double averageMatchScore
    ) {
    }

    public record Distribution(String name, double value, double percent) {
    }

    public record TrendPoint(String month, int jobCount, int applicationCount) {
    }

    public record HotSkill(String skill, int freqCount) {
    }

    public record Metadata(String sourceDataset, LocalDate statDate, LocalDateTime updatedAt) {
    }

    public record Dashboard(
            Overview overview,
            List<Distribution> salaryDistribution,
            List<Distribution> cityDistribution,
            List<Distribution> educationDistribution,
            List<Distribution> experienceDistribution,
            List<Distribution> industryDistribution,
            List<TrendPoint> trend,
            List<HotSkill> hotSkills,
            Metadata metadata
    ) {
    }
}
