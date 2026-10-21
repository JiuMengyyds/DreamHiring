package com.dreamhiring.vo;

import com.dreamhiring.entity.DomainEnums.AnnouncementChannel;
import com.dreamhiring.entity.DomainEnums.AnnouncementStatus;

import java.time.LocalDateTime;

public record AnnouncementView(
        Long id,
        String title,
        String summary,
        String content,
        AnnouncementChannel channel,
        AnnouncementStatus status,
        Long publisherId,
        LocalDateTime publishedAt,
        LocalDateTime createdAt
) {
}
