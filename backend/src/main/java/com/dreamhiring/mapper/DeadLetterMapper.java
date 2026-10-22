package com.dreamhiring.mapper;

import com.dreamhiring.entity.DeadLetterRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface DeadLetterMapper {

    List<DeadLetterRecord> findPage(@Param("status") String status);

    DeadLetterRecord findById(@Param("id") Long id);

    int insert(DeadLetterRecord record);

    int claimForReplay(@Param("id") Long id, @Param("updateTime") LocalDateTime updateTime);

    int markReplayed(@Param("id") Long id, @Param("replayTime") LocalDateTime replayTime);

    int releaseReplay(@Param("id") Long id, @Param("updateTime") LocalDateTime updateTime);
}
