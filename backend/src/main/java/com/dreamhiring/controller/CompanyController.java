package com.dreamhiring.controller;

import com.dreamhiring.common.PageVO;
import com.dreamhiring.common.Result;
import com.dreamhiring.dto.CompanyRequests.JobStatusRequest;
import com.dreamhiring.dto.CompanyRequests.JobUpsertRequest;
import com.dreamhiring.dto.CompanyRequests.UpdateProfileRequest;
import com.dreamhiring.service.CompanyService;
import com.dreamhiring.vo.CompanyViews.CompanyJobView;
import com.dreamhiring.vo.CompanyViews.CompanyView;
import com.dreamhiring.vo.CompanyViews.DashboardView;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/company")
@PreAuthorize("hasRole('COMPANY')")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping("/profile")
    public Result<CompanyView> profile() {
        return Result.success(companyService.getProfile());
    }

    @PutMapping("/profile")
    public Result<CompanyView> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return Result.success(companyService.updateProfile(request));
    }

    @GetMapping("/jobs")
    public Result<PageVO<CompanyJobView>> jobs(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String auditStatus,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return Result.success(companyService.listJobs(status, auditStatus, keyword, page, size));
    }

    @PostMapping("/jobs")
    public Result<CompanyJobView> createJob(@Valid @RequestBody JobUpsertRequest request) {
        return Result.success(companyService.createJob(request));
    }

    @GetMapping("/jobs/{jobId}")
    public Result<CompanyJobView> jobDetail(@PathVariable Long jobId) {
        return Result.success(companyService.jobDetail(jobId));
    }

    @PutMapping("/jobs/{jobId}")
    public Result<CompanyJobView> updateJob(
            @PathVariable Long jobId,
            @Valid @RequestBody JobUpsertRequest request
    ) {
        return Result.success(companyService.updateJob(jobId, request));
    }

    @DeleteMapping("/jobs/{jobId}")
    public Result<Void> deleteJob(@PathVariable Long jobId) {
        companyService.deleteJob(jobId);
        return Result.success();
    }

    @PutMapping("/jobs/{jobId}/status")
    public Result<CompanyJobView> updateJobStatus(
            @PathVariable Long jobId,
            @Valid @RequestBody JobStatusRequest request
    ) {
        return Result.success(companyService.updateJobStatus(jobId, request));
    }

    @GetMapping("/dashboard")
    public Result<DashboardView> dashboard() {
        return Result.success(companyService.dashboard());
    }
}
