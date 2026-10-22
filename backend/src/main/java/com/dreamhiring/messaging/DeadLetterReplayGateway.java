package com.dreamhiring.messaging;

import com.dreamhiring.entity.DeadLetterRecord;

public interface DeadLetterReplayGateway {

    void replay(DeadLetterRecord record);
}
