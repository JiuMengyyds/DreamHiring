package com.dreamhiring.service;

import com.dreamhiring.vo.StatsViews.Dashboard;
import com.dreamhiring.vo.StatsViews.HotSkill;
import com.dreamhiring.vo.StatsViews.TrendPoint;

import java.util.List;

public interface StatsService {

    Dashboard dashboard();

    List<TrendPoint> trend(int months);

    List<HotSkill> hotSkills(int limit);
}
