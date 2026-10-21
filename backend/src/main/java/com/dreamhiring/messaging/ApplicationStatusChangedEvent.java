package com.dreamhiring.messaging;

import com.dreamhiring.entity.DomainEnums.ApplicationStatus;

public record ApplicationStatusChangedEvent(
        Long receiverId,
        Long applicationId,
        String jobTitle,
        ApplicationStatus status
) {
}
