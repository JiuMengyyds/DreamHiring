package com.dreamhiring.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobCategory {

    private Long id;
    private String name;
    private Long parentId;
    private Integer sort;
    private Integer deleted;
}
