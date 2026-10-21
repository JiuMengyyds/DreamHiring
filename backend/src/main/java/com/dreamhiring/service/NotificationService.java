package com.dreamhiring.service;

import com.dreamhiring.entity.DomainEnums.MessageType;
import com.dreamhiring.entity.MessageRecord;
import com.dreamhiring.mapper.MessageMapper;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class NotificationService {

    private final MessageMapper messageMapper;

    public NotificationService(MessageMapper messageMapper) {
        this.messageMapper = messageMapper;
    }

    public void send(
            Long receiverId,
            MessageType type,
            String title,
            String content,
            Long relatedId
    ) {
        insert(receiverId, type, title, content, relatedId, null);
    }

    public void sendOnce(
            Long receiverId,
            MessageType type,
            String title,
            String content,
            Long relatedId,
            String dedupKey
    ) {
        if (dedupKey != null && messageMapper.countByDedupKey(dedupKey) > 0) {
            return;
        }
        insert(receiverId, type, title, content, relatedId, dedupKey);
    }

    private void insert(
            Long receiverId,
            MessageType type,
            String title,
            String content,
            Long relatedId,
            String dedupKey
    ) {
        try {
            messageMapper.insert(MessageRecord.builder()
                .receiverId(receiverId)
                .type(type)
                .title(title)
                .content(content)
                .relatedId(relatedId)
                .dedupKey(dedupKey)
                .isRead(0)
                .createTime(LocalDateTime.now())
                .deleted(0)
                .build());
        } catch (DuplicateKeyException ignored) {
            // 唯一索引兜底并发重复消费，保持幂等。
        }
    }
}
