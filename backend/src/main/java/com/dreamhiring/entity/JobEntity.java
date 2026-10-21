package com.dreamhiring.entity;

import com.dreamhiring.entity.DomainEnums.AuditStatus;
import com.dreamhiring.entity.DomainEnums.EducationLevel;
import com.dreamhiring.entity.DomainEnums.ExperienceLevel;
import com.dreamhiring.entity.DomainEnums.JobStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobEntity {

    private Long id;
    private Long companyId;
    private Long categoryId;
    private String title;
    private String city;
    private String district;
    private Integer salaryMin;
    private Integer salaryMax;
    private EducationLevel education;
    private ExperienceLevel experience;
    private String description;
    private String duties;
    private String requirements;
    private String skillTags;
    private String perks;
    private JobStatus status;
    private AuditStatus auditStatus;
    private String auditReason;
    private Integer viewCount;
    private LocalDateTime publishTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer deleted;
}
