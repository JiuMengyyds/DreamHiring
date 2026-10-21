package com.dreamhiring.service;

import com.dreamhiring.common.PageVO;
import com.dreamhiring.dto.CompanyRequests.JobStatusRequest;
import com.dreamhiring.dto.CompanyRequests.JobUpsertRequest;
import com.dreamhiring.dto.CompanyRequests.UpdateProfileRequest;
import com.dreamhiring.vo.CompanyViews.CompanyJobView;
import com.dreamhiring.vo.CompanyViews.CompanyView;
import com.dreamhiring.vo.CompanyViews.DashboardView;

public interface CompanyService {

    CompanyView getProfile();

    CompanyView updateProfile(UpdateProfileRequest request);

    PageVO<CompanyJobView> listJobs(String status, String auditStatus, String keyword, int page, int size);

    CompanyJobView createJob(JobUpsertRequest request);

    CompanyJobView jobDetail(Long jobId);

    CompanyJobView updateJob(Long jobId, JobUpsertRequest request);

    void deleteJob(Long jobId);

    CompanyJobView updateJobStatus(Long jobId, JobStatusRequest request);

    DashboardView dashboard();
}
