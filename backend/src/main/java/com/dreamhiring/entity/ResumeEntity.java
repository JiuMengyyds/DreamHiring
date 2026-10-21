package com.dreamhiring.entity;

import com.dreamhiring.entity.DomainEnums.EducationLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeEntity {

    private Long id;
    private Long userId;
    private String name;
    private String title;
    private EducationLevel education;
    private Integer experienceYears;
    private String currentCity;
    private String expectCity;
    private Integer expectSalaryMin;
    private Integer expectSalaryMax;
    private String skillTags;
    private String summary;
    private String attachmentObjectKey;
    private Integer isDefault;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer deleted;
}
