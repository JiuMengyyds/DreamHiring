package com.dreamhiring.mapper;

import com.dreamhiring.entity.OperationLog;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface OperationLogMapper {

    int insert(OperationLog operationLog);
}
