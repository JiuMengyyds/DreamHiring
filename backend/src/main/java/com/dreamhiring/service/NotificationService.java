package com.dreamhiring.service;

import com.dreamhiring.entity.DomainEnums.MessageType;
import com.dreamhiring.entity.DomainEnums.AnnouncementChannel;
import com.dreamhiring.entity.MessageRecord;
import com.dreamhiring.mapper.MessageMapper;
import com.dreamhiring.mapper.UserMapper;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final MessageMapper messageMapper;
    private final UserMapper userMapper;

    public NotificationService(MessageMapper messageMapper, UserMapper userMapper) {
        this.messageMapper = messageMapper;
        this.userMapper = userMapper;
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

    public void sendAnnouncement(
            Long announcementId,
            String title,
            String summary,
            AnnouncementChannel channel
    ) {
        List<String> roles = switch (channel) {
            case ALL -> List.of("SEEKER", "COMPANY", "ADMIN");
            case SEEKER -> List.of("SEEKER");
            case COMPANY -> List.of("COMPANY");
        };
        String content = summary == null || summary.isBlank()
                ? "请前往公告中心查看详情。"
                : summary;
        userMapper.findActiveIdsByRoles(roles).forEach(receiverId ->
                sendOnce(
                        receiverId,
                        MessageType.ANNOUNCEMENT,
                        "平台公告：" + title,
                        content,
                        announcementId,
                        "ANNOUNCEMENT:" + announcementId + ":" + receiverId
                )
        );
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
