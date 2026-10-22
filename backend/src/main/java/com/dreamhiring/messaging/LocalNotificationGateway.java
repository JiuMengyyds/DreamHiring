package com.dreamhiring.messaging;

import com.dreamhiring.entity.DomainEnums.MessageType;
import com.dreamhiring.service.NotificationService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.messaging", name = "mode", havingValue = "local", matchIfMissing = true)
public class LocalNotificationGateway implements NotificationGateway {

    private final NotificationService notificationService;

    public LocalNotificationGateway(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @Override
    public void publishApplicationStatusChanged(ApplicationStatusChangedEvent event) {
        notificationService.sendOnce(
                event.receiverId(),
                MessageType.APPLICATION,
                "投递状态更新",
                "你投递的「" + event.jobTitle() + "」状态已更新为 " + statusLabel(event.status()),
                event.applicationId(),
                event.notificationDedupKey()
        );
    }

    @Override
    public void publishAnnouncementPublished(AnnouncementPublishedEvent event) {
        notificationService.sendAnnouncement(
                event.announcementId(),
                event.title(),
                event.summary(),
                event.channel()
        );
    }

    private String statusLabel(com.dreamhiring.entity.DomainEnums.ApplicationStatus status) {
        return switch (status) {
            case PENDING_VIEW -> "待查看";
            case VIEWED -> "已查看";
            case INTERVIEW -> "邀面试";
            case REJECTED -> "不合适";
        };
    }
}
