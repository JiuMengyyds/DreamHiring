package com.dreamhiring.service;

import com.dreamhiring.entity.OperationLog;
import com.dreamhiring.mapper.OperationLogMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class OperationLogService {

    private final OperationLogMapper operationLogMapper;

    public OperationLogService(OperationLogMapper operationLogMapper) {
        this.operationLogMapper = operationLogMapper;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void record(
            Long operatorId,
            String resourceType,
            Long resourceId,
            String action,
            String result,
            String detail
    ) {
        operationLogMapper.insert(OperationLog.builder()
                .operatorId(operatorId)
                .resourceType(resourceType)
                .resourceId(resourceId)
                .action(action)
                .result(result)
                .detail(detail)
                .createTime(LocalDateTime.now())
                .build());
    }
}
