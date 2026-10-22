package com.dreamhiring.messaging;

import com.rabbitmq.client.Channel;
import com.dreamhiring.entity.DomainEnums.MessageType;
import com.dreamhiring.service.NotificationService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@ConditionalOnProperty(prefix = "app.messaging", name = "mode", havingValue = "rabbit")
public class RabbitNotificationConsumer {

    private final NotificationService notificationService;

    public RabbitNotificationConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = RabbitNotificationConfig.QUEUE)
    public void receive(
            ApplicationStatusChangedEvent event,
            Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag
    ) throws IOException {
        notificationService.sendOnce(
                event.receiverId(),
                MessageType.APPLICATION,
                "投递状态更新",
                "你投递的「" + event.jobTitle() + "」状态已更新为 " + statusLabel(event),
                event.applicationId(),
                event.notificationDedupKey()
        );
        channel.basicAck(deliveryTag, false);
    }

    private String statusLabel(ApplicationStatusChangedEvent event) {
        return switch (event.status()) {
            case PENDING_VIEW -> "待查看";
            case VIEWED -> "已查看";
            case INTERVIEW -> "邀面试";
            case REJECTED -> "不合适";
        };
    }
}
