package com.dreamhiring.service.impl;

import com.dreamhiring.entity.AnalysisStat;
import com.dreamhiring.entity.HotSkill;
import com.dreamhiring.mapper.StatsMapper;
import com.dreamhiring.service.StatsService;
import com.dreamhiring.vo.StatsViews;
import com.dreamhiring.vo.StatsViews.Dashboard;
import com.dreamhiring.vo.StatsViews.Distribution;
import com.dreamhiring.vo.StatsViews.Metadata;
import com.dreamhiring.vo.StatsViews.Overview;
import com.dreamhiring.vo.StatsViews.TrendPoint;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class StatsServiceImpl implements StatsService {

    private final StatsMapper statsMapper;

    public StatsServiceImpl(StatsMapper statsMapper) {
        this.statsMapper = statsMapper;
    }

    @Override
    public Dashboard dashboard() {
        List<AnalysisStat> stats = statsMapper.findLatestStats();
        Map<String, List<AnalysisStat>> grouped = stats.stream()
                .collect(Collectors.groupingBy(AnalysisStat::getDimension));
        List<StatsViews.HotSkill> skills = hotSkills(20);
        LocalDate statDate = stats.stream()
                .map(AnalysisStat::getStatDate)
                .max(LocalDate::compareTo)
                .orElse(LocalDate.now());
        String sourceDataset = stats.isEmpty() ? "未配置分析数据集" : stats.getFirst().getSourceDataset();
        long sampleCount = overviewValue(grouped.get("overview"), "sample_count")
                .map(BigDecimal::longValue)
                .orElseGet(() -> (long) statsMapper.countJobs());
        double averageSalary = overviewValue(grouped.get("overview"), "average_salary")
                .map(BigDecimal::doubleValue)
                .orElseGet(statsMapper::averageSalary);
        return new Dashboard(
                new Overview(
                        sampleCount,
                        round(averageSalary),
                        ratio(statsMapper.countApplications(), statsMapper.countJobs()),
                        round(statsMapper.averageMatchScore())
                ),
                distributions(grouped.get("salary")),
                distributions(grouped.get("city")),
                distributions(grouped.get("education")),
                distributions(grouped.get("experience")),
                distributions(grouped.get("industry")),
                trend(12),
                skills,
                new Metadata(sourceDataset, statDate, LocalDateTime.now())
        );
    }

    @Override
    public List<TrendPoint> trend(int months) {
        int normalizedMonths = Math.max(1, Math.min(months, 24));
        Map<YearMonth, Long> jobsByMonth = groupByMonth(statsMapper.findJobCreateTimes());
        Map<YearMonth, Long> applicationsByMonth =
                groupByMonth(statsMapper.findApplicationDeliveryTimes());
        YearMonth current = YearMonth.now(ZoneId.of("Asia/Shanghai"));
        return java.util.stream.IntStream.rangeClosed(0, normalizedMonths - 1)
                .mapToObj(offset -> current.minusMonths(normalizedMonths - 1L - offset))
                .map(month -> new TrendPoint(
                        month.toString(),
                        jobsByMonth.getOrDefault(month, 0L).intValue(),
                        applicationsByMonth.getOrDefault(month, 0L).intValue()
                ))
                .toList();
    }

    @Override
    public List<StatsViews.HotSkill> hotSkills(int limit) {
        return statsMapper.findHotSkills(Math.max(1, Math.min(limit, 50))).stream()
                .map(skill -> new StatsViews.HotSkill(skill.getSkill(), skill.getFreqCount()))
                .toList();
    }

    private List<Distribution> distributions(List<AnalysisStat> stats) {
        if (stats == null) {
            return List.of();
        }
        return stats.stream()
                .map(stat -> new Distribution(stat.getDimValue(), stat.getStatValue().doubleValue(), stat.getStatValue().doubleValue()))
                .toList();
    }

    private double round(Double value) {
        if (value == null) {
            return 0;
        }
        return BigDecimal.valueOf(value).setScale(1, RoundingMode.HALF_UP).doubleValue();
    }

    private double ratio(int numerator, int denominator) {
        if (denominator == 0) {
            return 0;
        }
        return Math.round(numerator * 100.0 / denominator) / 100.0;
    }

    private Map<YearMonth, Long> groupByMonth(List<LocalDateTime> values) {
        return values.stream().collect(Collectors.groupingBy(
                value -> YearMonth.from(value),
                Collectors.counting()
        ));
    }

    private java.util.Optional<BigDecimal> overviewValue(List<AnalysisStat> stats, String name) {
        if (stats == null) {
            return java.util.Optional.empty();
        }
        return stats.stream()
                .filter(stat -> name.equals(stat.getDimValue()))
                .map(AnalysisStat::getStatValue)
                .findFirst();
    }
}
