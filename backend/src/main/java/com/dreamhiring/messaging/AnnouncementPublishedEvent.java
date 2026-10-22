package com.dreamhiring.messaging;

import com.dreamhiring.entity.DomainEnums.AnnouncementChannel;

public record AnnouncementPublishedEvent(
        Long announcementId,
        String title,
        String summary,
        AnnouncementChannel channel
) {
}
