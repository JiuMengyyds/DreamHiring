package com.dreamhiring.messaging;

import com.dreamhiring.entity.DeadLetterRecord;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@ConditionalOnProperty(prefix = "app.messaging", name = "mode", havingValue = "rabbit")
public class RabbitDeadLetterReplayGateway implements DeadLetterReplayGateway {

    private static final long CONFIRM_TIMEOUT_MILLIS = 5_000;

    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public RabbitDeadLetterReplayGateway(RabbitTemplate rabbitTemplate, ObjectMapper objectMapper) {
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public void replay(DeadLetterRecord record) {
        MessageProperties properties = new MessageProperties();
        properties.setContentType(record.getContentType());
        properties.setContentEncoding(StandardCharsets.UTF_8.name());
        properties.setDeliveryMode(MessageDeliveryMode.PERSISTENT);
        properties.setMessageId(record.getMessageId());
        properties.setCorrelationId(record.getCorrelationId());
        properties.setHeaders(readHeaders(record.getHeadersJson()));

        Message message = new Message(record.getMessageBody().getBytes(StandardCharsets.UTF_8), properties);
        String exchange = record.getExchangeName() == null ? "" : record.getExchangeName();
        String routingKey = record.getRoutingKey() == null ? "" : record.getRoutingKey();
        rabbitTemplate.invoke(operations -> {
            operations.send(exchange, routingKey, message);
            operations.waitForConfirmsOrDie(CONFIRM_TIMEOUT_MILLIS);
            return null;
        });
    }

    private Map<String, Object> readHeaders(String headersJson) {
        if (headersJson == null || headersJson.isBlank()) {
            return Map.of();
        }
        try {
            return objectMapper.readValue(headersJson, new TypeReference<LinkedHashMap<String, Object>>() {
            });
        } catch (Exception exception) {
            return Map.of();
        }
    }
}
