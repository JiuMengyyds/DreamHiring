package com.dreamhiring.controller;

import com.dreamhiring.common.PageVO;
import com.dreamhiring.common.Result;
import com.dreamhiring.dto.ApplicationRequests.CreateRequest;
import com.dreamhiring.dto.ApplicationRequests.RemarkRequest;
import com.dreamhiring.dto.ApplicationRequests.StatusRequest;
import com.dreamhiring.service.ApplicationService;
import com.dreamhiring.vo.ApplicationViews.ApplicationDetailView;
import com.dreamhiring.vo.ApplicationViews.ApplicationView;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ApplicationController {

    private final ApplicationService applicationService;

    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    @PostMapping("/applications")
    public Result<ApplicationView> create(@Valid @RequestBody CreateRequest request) {
        return Result.success(applicationService.create(request));
    }

    @GetMapping("/applications/my")
    public Result<PageVO<ApplicationView>> mine(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return Result.success(applicationService.mine(status, page, size));
    }

    @GetMapping("/applications/{applicationId}")
    public Result<ApplicationDetailView> myDetail(@PathVariable Long applicationId) {
        return Result.success(applicationService.myDetail(applicationId));
    }

    @GetMapping("/company/applications")
    public Result<PageVO<ApplicationDetailView>> companyList(
            @RequestParam(required = false) Long jobId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return Result.success(applicationService.companyList(jobId, status, keyword, page, size));
    }

    @GetMapping("/company/applications/{applicationId}")
    public Result<ApplicationDetailView> companyDetail(@PathVariable Long applicationId) {
        return Result.success(applicationService.companyDetail(applicationId));
    }

    @PutMapping("/company/applications/{applicationId}/status")
    public Result<ApplicationView> updateStatus(
            @PathVariable Long applicationId,
            @Valid @RequestBody StatusRequest request
    ) {
        return Result.success(applicationService.updateStatus(applicationId, request));
    }

    @PutMapping("/company/applications/{applicationId}/remark")
    public Result<ApplicationView> updateRemark(
            @PathVariable Long applicationId,
            @Valid @RequestBody RemarkRequest request
    ) {
        return Result.success(applicationService.updateRemark(applicationId, request.remark()));
    }
}
