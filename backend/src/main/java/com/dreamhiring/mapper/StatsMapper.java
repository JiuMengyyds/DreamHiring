package com.dreamhiring.mapper;

import com.dreamhiring.entity.AnalysisStat;
import com.dreamhiring.entity.HotSkill;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface StatsMapper {

    List<AnalysisStat> findLatestStats();

    List<AnalysisStat> findByDimension(@Param("dimension") String dimension);

    List<HotSkill> findHotSkills(@Param("limit") int limit);

    int countJobs();

    Double averageSalary();

    Double averageMatchScore();

    int countApplications();

    List<LocalDateTime> findJobCreateTimes();

    List<LocalDateTime> findApplicationDeliveryTimes();
}
