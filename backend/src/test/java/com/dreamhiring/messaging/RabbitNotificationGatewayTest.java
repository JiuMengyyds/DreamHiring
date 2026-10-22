package com.dreamhiring.messaging;

import com.dreamhiring.entity.DomainEnums.ApplicationStatus;
import com.rabbitmq.client.Channel;
import com.dreamhiring.service.NotificationService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

class RabbitNotificationGatewayTest {

    @AfterEach
    void clearTransactionSynchronization() {
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }

    @Test
    void messageShouldBePublishedOnlyAfterTransactionCommit() {
        RabbitTemplate rabbitTemplate = mock(RabbitTemplate.class);
        RabbitNotificationGateway gateway = new RabbitNotificationGateway(rabbitTemplate);
        ApplicationStatusChangedEvent event = new ApplicationStatusChangedEvent(
                1L,
                2L,
                "产品设计师",
                ApplicationStatus.INTERVIEW
        );

        TransactionSynchronizationManager.initSynchronization();
        gateway.publishApplicationStatusChanged(event);
        verifyNoInteractions(rabbitTemplate);

        TransactionSynchronizationManager.getSynchronizations()
                .forEach(TransactionSynchronization::afterCommit);
        verify(rabbitTemplate).convertAndSend(
                RabbitNotificationConfig.EXCHANGE,
                RabbitNotificationConfig.ROUTING_KEY,
                event
        );
    }

    @Test
    void consumerShouldAcknowledgeOnlyAfterNotificationSucceeds() throws Exception {
        NotificationService notificationService = mock(NotificationService.class);
        Channel channel = mock(Channel.class);
        RabbitNotificationConsumer consumer = new RabbitNotificationConsumer(notificationService);
        ApplicationStatusChangedEvent event = new ApplicationStatusChangedEvent(
                1L,
                2L,
                "产品设计师",
                ApplicationStatus.REJECTED
        );

        consumer.receive(event, channel, 8L);

        verify(notificationService).sendOnce(
                1L,
                com.dreamhiring.entity.DomainEnums.MessageType.APPLICATION,
                "投递状态更新",
                "你投递的「产品设计师」状态已更新为 不合适",
                2L,
                "APPLICATION:2:REJECTED"
        );
        verify(channel).basicAck(8L, false);

        doThrow(new IllegalStateException("database unavailable"))
                .when(notificationService)
                .sendOnce(1L,
                        com.dreamhiring.entity.DomainEnums.MessageType.APPLICATION,
                        "投递状态更新",
                        "你投递的「产品设计师」状态已更新为 不合适",
                        3L,
                        "APPLICATION:3:REJECTED");
        ApplicationStatusChangedEvent retryEvent = new ApplicationStatusChangedEvent(
                1L,
                3L,
                "产品设计师",
                ApplicationStatus.REJECTED
        );
        assertThatThrownBy(() -> consumer.receive(retryEvent, channel, 9L))
                .isInstanceOf(IllegalStateException.class);
        verify(channel, never()).basicAck(9L, false);
    }

    @Test
    void differentStatusesShouldUseDifferentDedupKeys() {
        ApplicationStatusChangedEvent interview = new ApplicationStatusChangedEvent(
                1L,
                2L,
                "产品设计师",
                ApplicationStatus.INTERVIEW
        );
        ApplicationStatusChangedEvent rejected = new ApplicationStatusChangedEvent(
                1L,
                2L,
                "产品设计师",
                ApplicationStatus.REJECTED
        );

        assertThat(interview.notificationDedupKey())
                .isEqualTo("APPLICATION:2:INTERVIEW");
        assertThat(rejected.notificationDedupKey())
                .isEqualTo("APPLICATION:2:REJECTED")
                .isNotEqualTo(interview.notificationDedupKey());
    }
}
