package com.dreamhiring.vo;

import com.dreamhiring.entity.DomainEnums.DeadLetterStatus;

import java.time.LocalDateTime;
import java.util.Map;

public final class DeadLetterViews {

    private DeadLetterViews() {
    }

    public record DeadLetterView(
            Long id,
            String queueName,
            String exchangeName,
            String routingKey,
            String messageId,
            String correlationId,
            String messageBody,
            String contentType,
            Map<String, Object> headers,
            String failureReason,
            DeadLetterStatus status,
            int replayCount,
            LocalDateTime createdAt,
            LocalDateTime replayedAt
    ) {
    }
}
