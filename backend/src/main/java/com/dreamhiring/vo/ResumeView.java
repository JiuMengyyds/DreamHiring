package com.dreamhiring.vo;

import com.dreamhiring.entity.DomainEnums.EducationLevel;

import java.time.LocalDateTime;
import java.util.List;

public record ResumeView(
        Long id,
        Long userId,
        String name,
        String title,
        EducationLevel education,
        Integer experienceYears,
        String currentCity,
        String expectCity,
        Integer expectSalaryMin,
        Integer expectSalaryMax,
        List<String> skillTags,
        String summary,
        String attachmentObjectKey,
        String attachmentUrl,
        boolean isDefault,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
