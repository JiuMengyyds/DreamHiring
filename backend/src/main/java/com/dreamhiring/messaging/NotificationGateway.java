package com.dreamhiring.messaging;

public interface NotificationGateway {

    void publishApplicationStatusChanged(ApplicationStatusChangedEvent event);
}
