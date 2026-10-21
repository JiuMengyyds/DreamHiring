package com.dreamhiring.entity;

import lombok.Data;

import java.time.LocalDate;

@Data
public class HotSkill {

    private String skill;
    private Integer freqCount;
    private String sourceDataset;
    private LocalDate statDate;
}
