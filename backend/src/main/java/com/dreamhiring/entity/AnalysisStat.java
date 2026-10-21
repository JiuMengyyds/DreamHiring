package com.dreamhiring.entity;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AnalysisStat {

    private String dimension;
    private String dimValue;
    private String metric;
    private BigDecimal statValue;
    private String sourceDataset;
    private LocalDate statDate;
}
