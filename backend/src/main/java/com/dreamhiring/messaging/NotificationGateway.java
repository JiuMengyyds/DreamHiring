package com.dreamhiring.messaging;

public interface NotificationGateway {

    void publishApplicationStatusChanged(ApplicationStatusChangedEvent event);

    void publishAnnouncementPublished(AnnouncementPublishedEvent event);
}
