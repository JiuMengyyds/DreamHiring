package com.dreamhiring.vo;

import com.dreamhiring.entity.DomainEnums.MessageType;

import java.time.LocalDateTime;

public final class MessageViews {

    private MessageViews() {
    }

    public record MessageView(
            Long id,
            Long receiverId,
            MessageType type,
            String title,
            String content,
            Long relatedId,
            boolean isRead,
            LocalDateTime createdAt
    ) {
    }
}
