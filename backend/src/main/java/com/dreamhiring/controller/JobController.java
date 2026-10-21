package com.dreamhiring.controller;

import com.dreamhiring.common.PageVO;
import com.dreamhiring.common.Result;
import com.dreamhiring.dto.JobQuery;
import com.dreamhiring.service.JobService;
import com.dreamhiring.vo.JobViews.CategoryNode;
import com.dreamhiring.vo.JobViews.JobDetail;
import com.dreamhiring.vo.JobViews.JobSummary;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class JobController {

    private final JobService jobService;

    public JobController(JobService jobService) {
        this.jobService = jobService;
    }

    @GetMapping("/jobs")
    public Result<PageVO<JobSummary>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Integer salaryMin,
            @RequestParam(required = false) Integer salaryMax,
            @RequestParam(required = false) String education,
            @RequestParam(required = false) String experience,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String industry,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        JobQuery query = new JobQuery(keyword, city, salaryMin, salaryMax, education, experience, categoryId, industry, sort);
        return Result.success(jobService.search(query, page, size));
    }

    @GetMapping("/jobs/hot")
    public Result<List<JobSummary>> hot(@RequestParam(defaultValue = "10") int limit) {
        return Result.success(jobService.hot(limit));
    }

    @GetMapping("/jobs/{jobId}")
    public Result<JobDetail> detail(@PathVariable Long jobId) {
        return Result.success(jobService.detail(jobId));
    }

    @GetMapping("/job-categories/tree")
    public Result<List<CategoryNode>> categories() {
        return Result.success(jobService.categoryTree());
    }
}
