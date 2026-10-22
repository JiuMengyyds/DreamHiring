package com.dreamhiring.messaging;

import com.dreamhiring.common.BusinessException;
import com.dreamhiring.common.ResultCode;
import com.dreamhiring.entity.DeadLetterRecord;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(
        prefix = "app.messaging",
        name = "mode",
        havingValue = "local",
        matchIfMissing = true
)
public class UnavailableDeadLetterReplayGateway implements DeadLetterReplayGateway {

    @Override
    public void replay(DeadLetterRecord record) {
        throw new BusinessException(ResultCode.UNPROCESSABLE_ENTITY, "死信重投仅在 RabbitMQ 模式可用");
    }
}
