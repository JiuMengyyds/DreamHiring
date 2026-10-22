package com.dreamhiring.entity;

import com.dreamhiring.entity.DomainEnums.DeadLetterStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeadLetterRecord {

    private Long id;
    private String queueName;
    private String exchangeName;
    private String routingKey;
    private String messageId;
    private String correlationId;
    private String messageBody;
    private String contentType;
    private String headersJson;
    private String failureReason;
    private DeadLetterStatus status;
    private Integer replayCount;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private LocalDateTime replayTime;
}
