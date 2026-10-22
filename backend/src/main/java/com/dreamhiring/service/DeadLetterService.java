package com.dreamhiring.service;

import com.dreamhiring.common.PageVO;
import com.dreamhiring.entity.DomainEnums.DeadLetterStatus;
import com.dreamhiring.vo.DeadLetterViews.DeadLetterView;

public interface DeadLetterService {

    void archive(DeadLetterArchive archive);

    PageVO<DeadLetterView> list(DeadLetterStatus status, int page, int size);

    DeadLetterView replay(Long deadLetterId);

    record DeadLetterArchive(
            String queueName,
            String exchangeName,
            String routingKey,
            String messageId,
            String correlationId,
            String messageBody,
            String contentType,
            String headersJson,
            String failureReason
    ) {
    }
}
