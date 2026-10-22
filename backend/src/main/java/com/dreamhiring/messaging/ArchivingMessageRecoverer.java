package com.dreamhiring.messaging;

import com.dreamhiring.service.DeadLetterService;
import com.dreamhiring.service.DeadLetterService.DeadLetterArchive;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.retry.MessageRecoverer;
import org.springframework.amqp.rabbit.retry.RejectAndDontRequeueRecoverer;
import org.springframework.amqp.support.AmqpHeaders;

import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

public class ArchivingMessageRecoverer implements MessageRecoverer {

    private static final Logger LOGGER = LoggerFactory.getLogger(ArchivingMessageRecoverer.class);
    private static final int MAX_FAILURE_REASON_LENGTH = 1000;

    private final DeadLetterService deadLetterService;
    private final ObjectMapper objectMapper;
    private final RejectAndDontRequeueRecoverer brokerDeadLetterRecoverer =
            new RejectAndDontRequeueRecoverer();

    public ArchivingMessageRecoverer(DeadLetterService deadLetterService, ObjectMapper objectMapper) {
        this.deadLetterService = deadLetterService;
        this.objectMapper = objectMapper;
    }

    @Override
    public void recover(Message message, Throwable cause) {
        try {
            deadLetterService.archive(toArchive(message, cause));
        } catch (Exception exception) {
            LOGGER.error("Failed to archive dead-letter message before broker handoff", exception);
        }
        brokerDeadLetterRecoverer.recover(message, cause);
    }

    private DeadLetterArchive toArchive(Message message, Throwable cause) {
        var properties = message.getMessageProperties();
        return new DeadLetterArchive(
                properties.getConsumerQueue(),
                properties.getReceivedExchange(),
                properties.getReceivedRoutingKey(),
                properties.getMessageId(),
                properties.getCorrelationId(),
                new String(message.getBody(), StandardCharsets.UTF_8),
                properties.getContentType(),
                serializeHeaders(properties.getHeaders()),
                failureReason(cause)
        );
    }

    private String serializeHeaders(Map<String, Object> headers) {
        try {
            Map<String, Object> serializableHeaders = new LinkedHashMap<>();
            if (headers != null) {
                headers.forEach((key, value) -> {
                    if (!AmqpHeaders.CHANNEL.equals(key) && !AmqpHeaders.DELIVERY_TAG.equals(key)) {
                        serializableHeaders.put(key, value);
                    }
                });
            }
            return objectMapper.writeValueAsString(serializableHeaders);
        } catch (Exception exception) {
            return "{}";
        }
    }

    private String failureReason(Throwable cause) {
        if (cause == null) {
            return "Unknown consumer failure";
        }
        String message = cause.getMessage() == null ? "" : cause.getMessage().replaceAll("\\s+", " ").trim();
        String reason = cause.getClass().getSimpleName() + (message.isEmpty() ? "" : ": " + message);
        return reason.length() <= MAX_FAILURE_REASON_LENGTH
                ? reason
                : reason.substring(0, MAX_FAILURE_REASON_LENGTH);
    }
}
