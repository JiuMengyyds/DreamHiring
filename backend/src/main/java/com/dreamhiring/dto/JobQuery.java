package com.dreamhiring.dto;

public record JobQuery(
        String keyword,
        String city,
        Integer salaryMin,
        Integer salaryMax,
        String education,
        String experience,
        Long categoryId,
        String industry,
        String sort
) {
}
