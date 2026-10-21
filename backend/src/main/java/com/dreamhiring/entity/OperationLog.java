package com.dreamhiring.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationLog {

    private Long id;
    private Long operatorId;
    private String resourceType;
    private Long resourceId;
    private String action;
    private String result;
    private String detail;
    private LocalDateTime createTime;
}
