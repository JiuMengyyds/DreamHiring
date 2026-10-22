package com.dreamhiring.vo;

import com.dreamhiring.entity.DomainEnums.AuditStatus;
import com.dreamhiring.entity.DomainEnums.CompanyAuditStatus;
import com.dreamhiring.entity.DomainEnums.JobStatus;
import com.dreamhiring.vo.ApplicationViews.ApplicationView;
import com.dreamhiring.vo.JobViews.CompanyBrief;
import com.dreamhiring.vo.JobViews.MatchExplanation;

import java.time.LocalDateTime;
import java.util.List;

public final class CompanyViews {

    private CompanyViews() {
    }

    public record CompanyView(
            Long id,
            Long userId,
            String name,
            String industry,
            String scale,
            String city,
            String logoObjectKey,
            String logoUrl,
            String intro,
            String contactName,
            String contactPhone,
            String contactEmail,
            int activeJobCount,
            CompanyAuditStatus auditStatus,
            String auditReason,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
    }

    public record CompanyJobView(
            Long id,
            Long companyId,
            String companyName,
            String companyLogoUrl,
            String title,
            String city,
            String district,
            Integer salaryMin,
            Integer salaryMax,
            com.dreamhiring.entity.DomainEnums.EducationLevel education,
            com.dreamhiring.entity.DomainEnums.ExperienceLevel experience,
            String industry,
            List<String> skillTags,
            List<String> perks,
            JobStatus status,
            int viewCount,
            Integer matchScore,
            LocalDateTime updatedAt,
            String description,
            List<String> duties,
            List<String> requirements,
            CompanyBrief company,
            MatchExplanation matchExplanation,
            LocalDateTime publishedAt,
            AuditStatus auditStatus,
            String auditReason,
            int applicantCount,
            int pendingApplicantCount,
            LocalDateTime createdAt
    ) {
    }

    public record DashboardView(
            int activeJobCount,
            int pendingCandidateCount,
            int interviewCount,
            double averageMatchScore,
            Funnel funnel,
            List<ApplicationView> recentApplications
    ) {
    }

    public record Funnel(int views, int applications, int interviews, int hires) {
    }
}
