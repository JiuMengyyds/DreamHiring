package com.dreamhiring.controller;

import com.dreamhiring.common.Result;
import com.dreamhiring.service.StatsService;
import com.dreamhiring.vo.StatsViews.Dashboard;
import com.dreamhiring.vo.StatsViews.HotSkill;
import com.dreamhiring.vo.StatsViews.TrendPoint;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/dashboard")
    public Result<Dashboard> dashboard() {
        return Result.success(statsService.dashboard());
    }

    @GetMapping("/trend")
    public Result<List<TrendPoint>> trend(@RequestParam(defaultValue = "12") int months) {
        return Result.success(statsService.trend(months));
    }

    @GetMapping("/hot-skills")
    public Result<List<HotSkill>> hotSkills(@RequestParam(defaultValue = "20") int limit) {
        return Result.success(statsService.hotSkills(limit));
    }
}
