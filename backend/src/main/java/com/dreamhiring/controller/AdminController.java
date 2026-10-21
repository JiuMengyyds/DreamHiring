package com.dreamhiring.controller;

import com.dreamhiring.common.PageVO;
import com.dreamhiring.common.Result;
import com.dreamhiring.dto.AdminRequests.AnnouncementUpsertRequest;
import com.dreamhiring.dto.AdminRequests.AuditRequest;
import com.dreamhiring.dto.AdminRequests.CategoryUpsertRequest;
import com.dreamhiring.dto.AdminRequests.UserStatusRequest;
import com.dreamhiring.service.AdminService;
import com.dreamhiring.vo.AnnouncementView;
import com.dreamhiring.vo.AuthViews.UserProfileView;
import com.dreamhiring.vo.CompanyViews.CompanyJobView;
import com.dreamhiring.vo.CompanyViews.CompanyView;
import com.dreamhiring.vo.JobViews.CategoryNode;
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
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public Result<PageVO<UserProfileView>> users(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return Result.success(adminService.listUsers(keyword, role, status, page, size));
    }

    @GetMapping("/users/{userId}")
    public Result<UserProfileView> userDetail(@PathVariable Long userId) {
        return Result.success(adminService.userDetail(userId));
    }

    @PutMapping("/users/{userId}/status")
    public Result<UserProfileView> updateUserStatus(
            @PathVariable Long userId,
            @Valid @RequestBody UserStatusRequest request
    ) {
        return Result.success(adminService.updateUserStatus(userId, request));
    }

    @DeleteMapping("/users/{userId}")
    public Result<Void> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return Result.success();
    }

    @GetMapping("/companies")
    public Result<PageVO<CompanyView>> companies(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String auditStatus,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return Result.success(adminService.listCompanies(keyword, auditStatus, page, size));
    }

    @GetMapping("/companies/{companyId}")
    public Result<CompanyView> companyDetail(@PathVariable Long companyId) {
        return Result.success(adminService.companyDetail(companyId));
    }

    @PutMapping("/companies/{companyId}/audit")
    public Result<CompanyView> auditCompany(
            @PathVariable Long companyId,
            @Valid @RequestBody AuditRequest request
    ) {
        return Result.success(adminService.auditCompany(companyId, request));
    }

    @GetMapping("/jobs")
    public Result<PageVO<CompanyJobView>> jobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String auditStatus,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return Result.success(adminService.listJobs(keyword, status, auditStatus, page, size));
    }

    @GetMapping("/jobs/{jobId}")
    public Result<CompanyJobView> jobDetail(@PathVariable Long jobId) {
        return Result.success(adminService.jobDetail(jobId));
    }

    @PutMapping("/jobs/{jobId}/audit")
    public Result<CompanyJobView> auditJob(
            @PathVariable Long jobId,
            @Valid @RequestBody AuditRequest request
    ) {
        return Result.success(adminService.auditJob(jobId, request));
    }

    @PostMapping("/job-categories")
    public Result<CategoryNode> createCategory(@Valid @RequestBody CategoryUpsertRequest request) {
        return Result.success(adminService.createCategory(request));
    }

    @PutMapping("/job-categories/{categoryId}")
    public Result<CategoryNode> updateCategory(
            @PathVariable Long categoryId,
            @Valid @RequestBody CategoryUpsertRequest request
    ) {
        return Result.success(adminService.updateCategory(categoryId, request));
    }

    @DeleteMapping("/job-categories/{categoryId}")
    public Result<Void> deleteCategory(@PathVariable Long categoryId) {
        adminService.deleteCategory(categoryId);
        return Result.success();
    }

    @GetMapping("/announcements")
    public Result<PageVO<AnnouncementView>> announcements(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return Result.success(adminService.listAnnouncements(keyword, status, page, size));
    }

    @PostMapping("/announcements")
    public Result<AnnouncementView> createAnnouncement(
            @Valid @RequestBody AnnouncementUpsertRequest request
    ) {
        return Result.success(adminService.createAnnouncement(request));
    }

    @PutMapping("/announcements/{announcementId}")
    public Result<AnnouncementView> updateAnnouncement(
            @PathVariable Long announcementId,
            @Valid @RequestBody AnnouncementUpsertRequest request
    ) {
        return Result.success(adminService.updateAnnouncement(announcementId, request));
    }

    @DeleteMapping("/announcements/{announcementId}")
    public Result<Void> deleteAnnouncement(@PathVariable Long announcementId) {
        adminService.deleteAnnouncement(announcementId);
        return Result.success();
    }
}
