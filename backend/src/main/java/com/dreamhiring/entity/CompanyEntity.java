package com.dreamhiring.entity;

import com.dreamhiring.entity.DomainEnums.CompanyAuditStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyEntity {

    private Long id;
    private Long userId;
    private String name;
    private String industry;
    private String scale;
    private String city;
    private String logoObjectKey;
    private String intro;
    private String contactName;
    private String contactPhone;
    private String contactEmail;
    private CompanyAuditStatus auditStatus;
    private String auditReason;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer deleted;
}
