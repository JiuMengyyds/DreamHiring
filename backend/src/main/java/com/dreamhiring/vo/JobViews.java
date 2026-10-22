package com.dreamhiring.vo;

import com.dreamhiring.entity.DomainEnums.CompanyAuditStatus;
import com.dreamhiring.entity.DomainEnums.EducationLevel;
import com.dreamhiring.entity.DomainEnums.ExperienceLevel;
import com.dreamhiring.entity.DomainEnums.JobStatus;

import java.time.LocalDateTime;
import java.util.List;

public final class JobViews {

    private JobViews() {
    }

    public record CompanyBrief(
            Long id,
            String name,
            String industry,
            String scale,
            String city,
            String logoObjectKey,
            String logoUrl,
            CompanyAuditStatus auditStatus
    ) {
    }

    public record MatchExplanation(
            int score,
            List<String> matchedSkills,
            List<String> missingSkills,
            int matchedCount,
            int totalCount
    ) {
    }

    public record JobSummary(
            Long id,
            Long companyId,
            String companyName,
            String companyLogoUrl,
            String title,
            String city,
            String district,
            Integer salaryMin,
            Integer salaryMax,
            EducationLevel education,
            ExperienceLevel experience,
            String industry,
            List<String> skillTags,
            List<String> perks,
            JobStatus status,
            int viewCount,
            Integer matchScore,
            LocalDateTime updatedAt
    ) {
    }

    public record JobDetail(
            Long id,
            Long companyId,
            String companyName,
            String companyLogoUrl,
            String title,
            String city,
            String district,
            Integer salaryMin,
            Integer salaryMax,
            EducationLevel education,
            ExperienceLevel experience,
            String industry,
            List<String> skillTags,
            List<String> perks,
            JobStatus status,
            int viewCount,
            Integer matchScore,
            MatchExplanation matchExplanation,
            String description,
            List<String> duties,
            List<String> requirements,
            CompanyBrief company,
            LocalDateTime publishedAt,
            LocalDateTime updatedAt
    ) {
    }

    public record CategoryNode(
            Long id,
            String name,
            Long parentId,
            Integer sort,
            int jobCount,
            List<CategoryNode> children
    ) {
    }
}
