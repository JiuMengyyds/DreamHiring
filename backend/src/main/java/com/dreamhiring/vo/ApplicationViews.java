package com.dreamhiring.vo;

import com.dreamhiring.entity.DomainEnums.ApplicationStatus;
import com.dreamhiring.vo.AuthViews.UserView;
import com.dreamhiring.vo.JobViews.JobSummary;

import java.time.LocalDateTime;

public final class ApplicationViews {

    private ApplicationViews() {
    }

    public record ApplicationView(
            Long id,
            Long resumeId,
            Long jobId,
            Long userId,
            ApplicationStatus status,
            Integer matchScore,
            String companyRemark,
            LocalDateTime deliveryTime,
            LocalDateTime handleTime,
            JobSummary job
    ) {
    }

    public record ApplicationDetailView(
            Long id,
            Long resumeId,
            Long jobId,
            Long userId,
            ApplicationStatus status,
            Integer matchScore,
            String companyRemark,
            LocalDateTime deliveryTime,
            LocalDateTime handleTime,
            JobSummary job,
            ResumeView resume,
            UserView candidate
    ) {
    }
}
