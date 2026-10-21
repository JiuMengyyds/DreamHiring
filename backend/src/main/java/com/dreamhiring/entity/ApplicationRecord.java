package com.dreamhiring.entity;

import com.dreamhiring.entity.DomainEnums.ApplicationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationRecord {

    private Long id;
    private Long resumeId;
    private Long jobId;
    private Long userId;
    private ApplicationStatus status;
    private Integer matchScore;
    private String companyRemark;
    private LocalDateTime deliveryTime;
    private LocalDateTime handleTime;
    private Integer deleted;
}
