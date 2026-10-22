package com.dreamhiring.service.impl;

import com.dreamhiring.common.BusinessException;
import com.dreamhiring.common.PageRequest;
import com.dreamhiring.common.PageVO;
import com.dreamhiring.common.ResultCode;
import com.dreamhiring.entity.DeadLetterRecord;
import com.dreamhiring.entity.DomainEnums.DeadLetterStatus;
import com.dreamhiring.mapper.DeadLetterMapper;
import com.dreamhiring.messaging.DeadLetterReplayGateway;
import com.dreamhiring.service.DeadLetterService;
import com.dreamhiring.vo.DeadLetterViews.DeadLetterView;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DeadLetterServiceImpl implements DeadLetterService {

    private final DeadLetterMapper deadLetterMapper;
    private final DeadLetterReplayGateway replayGateway;
    private final ObjectMapper objectMapper;

    public DeadLetterServiceImpl(
            DeadLetterMapper deadLetterMapper,
            DeadLetterReplayGateway replayGateway,
            ObjectMapper objectMapper
    ) {
        this.deadLetterMapper = deadLetterMapper;
        this.replayGateway = replayGateway;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void archive(DeadLetterArchive archive) {
        LocalDateTime now = LocalDateTime.now();
        DeadLetterRecord record = DeadLetterRecord.builder()
                .queueName(valueOrDefault(archive.queueName(), "unknown"))
                .exchangeName(valueOrDefault(archive.exchangeName(), ""))
                .routingKey(valueOrDefault(archive.routingKey(), ""))
                .messageId(archive.messageId())
                .correlationId(archive.correlationId())
                .messageBody(valueOrDefault(archive.messageBody(), ""))
                .contentType(valueOrDefault(archive.contentType(), "application/json"))
                .headersJson(valueOrDefault(archive.headersJson(), "{}"))
                .failureReason(archive.failureReason())
                .status(DeadLetterStatus.PENDING)
                .replayCount(0)
                .createTime(now)
                .updateTime(now)
                .build();
        deadLetterMapper.insert(record);
    }

    @Override
    public PageVO<DeadLetterView> list(DeadLetterStatus status, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        PageHelper.startPage(pageRequest.page(), pageRequest.size());
        Page<DeadLetterRecord> records =
                (Page<DeadLetterRecord>) deadLetterMapper.findPage(status == null ? null : status.name());
        List<DeadLetterView> views = records.stream().map(this::toView).toList();
        return PageVO.of(views, records.getTotal(), pageRequest.page(), pageRequest.size());
    }

    @Override
    public DeadLetterView replay(Long deadLetterId) {
        DeadLetterRecord record = deadLetterMapper.findById(deadLetterId);
        if (record == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "死信消息不存在");
        }
        LocalDateTime claimTime = LocalDateTime.now();
        if (deadLetterMapper.claimForReplay(deadLetterId, claimTime) == 0) {
            throw new BusinessException(ResultCode.CONFLICT, "死信消息正在重投或已经重投");
        }
        record.setStatus(DeadLetterStatus.REPLAYING);
        record.setUpdateTime(claimTime);
        try {
            replayGateway.replay(record);
            LocalDateTime replayTime = LocalDateTime.now();
            if (deadLetterMapper.markReplayed(deadLetterId, replayTime) == 0) {
                throw new BusinessException(ResultCode.CONFLICT, "死信消息状态已变化");
            }
            record.setStatus(DeadLetterStatus.REPLAYED);
            record.setReplayCount(record.getReplayCount() + 1);
            record.setReplayTime(replayTime);
            record.setUpdateTime(replayTime);
            return toView(record);
        } catch (RuntimeException exception) {
            deadLetterMapper.releaseReplay(deadLetterId, LocalDateTime.now());
            throw exception;
        }
    }

    private DeadLetterView toView(DeadLetterRecord record) {
        return new DeadLetterView(
                record.getId(),
                record.getQueueName(),
                record.getExchangeName(),
                record.getRoutingKey(),
                record.getMessageId(),
                record.getCorrelationId(),
                record.getMessageBody(),
                record.getContentType(),
                readHeaders(record.getHeadersJson()),
                record.getFailureReason(),
                record.getStatus(),
                record.getReplayCount() == null ? 0 : record.getReplayCount(),
                record.getCreateTime(),
                record.getReplayTime()
        );
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

    private String valueOrDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value;
    }
}
