package com.dreamhiring.service;

import com.dreamhiring.common.BusinessException;
import com.dreamhiring.entity.DeadLetterRecord;
import com.dreamhiring.entity.DomainEnums.DeadLetterStatus;
import com.dreamhiring.mapper.DeadLetterMapper;
import com.dreamhiring.messaging.DeadLetterReplayGateway;
import com.dreamhiring.service.impl.DeadLetterServiceImpl;
import com.dreamhiring.vo.DeadLetterViews.DeadLetterView;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class DeadLetterServiceImplTest {

    private final DeadLetterMapper mapper = mock(DeadLetterMapper.class);
    private final DeadLetterReplayGateway gateway = mock(DeadLetterReplayGateway.class);
    private final DeadLetterServiceImpl service =
            new DeadLetterServiceImpl(mapper, gateway, new ObjectMapper());

    @Test
    void replayShouldClaimSendAndMarkComplete() {
        DeadLetterRecord record = pendingRecord();
        when(mapper.findById(1L)).thenReturn(record);
        when(mapper.claimForReplay(eq(1L), any())).thenReturn(1);
        when(mapper.markReplayed(eq(1L), any())).thenReturn(1);

        DeadLetterView result = service.replay(1L);

        assertThat(result.status()).isEqualTo(DeadLetterStatus.REPLAYED);
        assertThat(result.replayCount()).isEqualTo(1);
        verify(gateway).replay(record);
    }

    @Test
    void failedReplayShouldReleasePendingClaim() {
        DeadLetterRecord record = pendingRecord();
        when(mapper.findById(1L)).thenReturn(record);
        when(mapper.claimForReplay(eq(1L), any())).thenReturn(1);
        doThrow(new IllegalStateException("broker unavailable")).when(gateway).replay(record);

        assertThatThrownBy(() -> service.replay(1L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("broker unavailable");

        verify(mapper).releaseReplay(eq(1L), any());
    }

    @Test
    void concurrentOrReplayedMessageShouldConflict() {
        when(mapper.findById(1L)).thenReturn(pendingRecord());
        when(mapper.claimForReplay(eq(1L), any())).thenReturn(0);

        assertThatThrownBy(() -> service.replay(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessage("死信消息正在重投或已经重投");
    }

    private DeadLetterRecord pendingRecord() {
        return DeadLetterRecord.builder()
                .id(1L)
                .queueName("dreamhiring.notification.queue")
                .exchangeName("dreamhiring.notification.exchange")
                .routingKey("application.status.changed")
                .messageBody("{}")
                .contentType("application/json")
                .headersJson("{}")
                .failureReason("database unavailable")
                .status(DeadLetterStatus.PENDING)
                .replayCount(0)
                .build();
    }
}
