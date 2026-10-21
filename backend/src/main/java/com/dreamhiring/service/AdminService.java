package com.dreamhiring.service;

import com.dreamhiring.common.PageVO;
import com.dreamhiring.dto.AdminRequests.AnnouncementUpsertRequest;
import com.dreamhiring.dto.AdminRequests.AuditRequest;
import com.dreamhiring.dto.AdminRequests.CategoryUpsertRequest;
import com.dreamhiring.dto.AdminRequests.UserStatusRequest;
import com.dreamhiring.vo.AnnouncementView;
import com.dreamhiring.vo.AuthViews.UserProfileView;
import com.dreamhiring.vo.CompanyViews.CompanyJobView;
import com.dreamhiring.vo.CompanyViews.CompanyView;
import com.dreamhiring.vo.JobViews.CategoryNode;

import java.util.List;

public interface AdminService {

    PageVO<UserProfileView> listUsers(String keyword, String role, String status, int page, int size);

    UserProfileView userDetail(Long userId);

    UserProfileView updateUserStatus(Long userId, UserStatusRequest request);

    void deleteUser(Long userId);

    PageVO<CompanyView> listCompanies(String keyword, String auditStatus, int page, int size);

    CompanyView companyDetail(Long companyId);

    CompanyView auditCompany(Long companyId, AuditRequest request);

    PageVO<CompanyJobView> listJobs(String keyword, String status, String auditStatus, int page, int size);

    CompanyJobView jobDetail(Long jobId);

    CompanyJobView auditJob(Long jobId, AuditRequest request);

    CategoryNode createCategory(CategoryUpsertRequest request);

    CategoryNode updateCategory(Long categoryId, CategoryUpsertRequest request);

    void deleteCategory(Long categoryId);

    PageVO<AnnouncementView> listAnnouncements(String keyword, String status, int page, int size);

    AnnouncementView createAnnouncement(AnnouncementUpsertRequest request);

    AnnouncementView updateAnnouncement(Long announcementId, AnnouncementUpsertRequest request);

    void deleteAnnouncement(Long announcementId);
}
