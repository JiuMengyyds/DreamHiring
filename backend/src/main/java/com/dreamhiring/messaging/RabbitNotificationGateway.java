package com.dreamhiring.messaging;

import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

@Component
@ConditionalOnProperty(prefix = "app.messaging", name = "mode", havingValue = "rabbit")
public class RabbitNotificationGateway implements NotificationGateway {

    private final RabbitTemplate rabbitTemplate;

    public RabbitNotificationGateway(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public void publishApplicationStatusChanged(ApplicationStatusChangedEvent event) {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    send(event);
                }
            });
            return;
        }
        send(event);
    }

    private void send(ApplicationStatusChangedEvent event) {
        rabbitTemplate.convertAndSend(
                RabbitNotificationConfig.EXCHANGE,
                RabbitNotificationConfig.ROUTING_KEY,
                event
        );
    }
}
