package com.dreamhiring.messaging;

import com.dreamhiring.service.DeadLetterService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.rabbitmq.client.Channel;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.support.AmqpHeaders;

import java.nio.charset.StandardCharsets;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

class ArchivingMessageRecovererTest {

    @Test
    void retryExhaustionShouldArchiveBeforeRejectingToDlq() throws Exception {
        DeadLetterService service = mock(DeadLetterService.class);
        Channel channel = mock(Channel.class);
        ArchivingMessageRecoverer recoverer = new ArchivingMessageRecoverer(service, new ObjectMapper());
        MessageProperties properties = new MessageProperties();
        properties.setConsumerQueue("dreamhiring.notification.queue");
        properties.setReceivedExchange("dreamhiring.notification.exchange");
        properties.setReceivedRoutingKey("application.status.changed");
        properties.setMessageId("message-1");
        properties.setCorrelationId("correlation-1");
        properties.setContentType("application/json");
        properties.setHeader("x-trace-id", "trace-1");
        properties.setHeader(AmqpHeaders.CHANNEL, channel);
        properties.setHeader(AmqpHeaders.DELIVERY_TAG, 7L);
        Message message = new Message("{\"id\":1}".getBytes(StandardCharsets.UTF_8), properties);

        assertThatThrownBy(() -> recoverer.recover(message, new IllegalStateException("consumer failed")))
                .isInstanceOf(org.springframework.amqp.rabbit.support.ListenerExecutionFailedException.class)
                .hasCauseInstanceOf(org.springframework.amqp.AmqpRejectAndDontRequeueException.class);

        verify(service).archive(argThat(archive ->
                "dreamhiring.notification.queue".equals(archive.queueName())
                        && "message-1".equals(archive.messageId())
                        && archive.failureReason().contains("consumer failed")
                        && archive.headersJson().contains("trace-1")
                        && !archive.headersJson().contains(AmqpHeaders.CHANNEL)
        ));
    }
}
