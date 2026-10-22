package com.dreamhiring.messaging;

import com.dreamhiring.service.NotificationService;
import com.rabbitmq.client.Channel;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@ConditionalOnProperty(prefix = "app.messaging", name = "mode", havingValue = "rabbit")
public class AnnouncementNotificationConsumer {

    private final NotificationService notificationService;

    public AnnouncementNotificationConsumer(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = RabbitNotificationConfig.ANNOUNCEMENT_QUEUE)
    public void receive(
            AnnouncementPublishedEvent event,
            Channel channel,
            @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag
    ) throws IOException {
        notificationService.sendAnnouncement(
                event.announcementId(),
                event.title(),
                event.summary(),
                event.channel()
        );
        channel.basicAck(deliveryTag, false);
    }
}
