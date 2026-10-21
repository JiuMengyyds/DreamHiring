package com.dreamhiring.vo;

import java.time.LocalDateTime;

public record FileView(
        String objectKey,
        String url,
        String visibility,
        LocalDateTime urlExpiresAt,
        String originalName,
        String contentType,
        long size
) {
}
