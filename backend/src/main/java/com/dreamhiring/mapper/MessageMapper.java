package com.dreamhiring.mapper;

import com.dreamhiring.entity.MessageRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface MessageMapper {

    List<MessageRecord> findByReceiverId(@Param("receiverId") Long receiverId,
                                         @Param("type") String type,
                                         @Param("isRead") Integer isRead);

    MessageRecord findByIdAndReceiver(@Param("id") Long id,
                                      @Param("receiverId") Long receiverId);

    int countUnread(@Param("receiverId") Long receiverId);

    int countByReceiver(@Param("receiverId") Long receiverId);

    int countByDedupKey(@Param("dedupKey") String dedupKey);

    int insert(MessageRecord message);

    int markRead(@Param("id") Long id, @Param("receiverId") Long receiverId);

    int markAllRead(@Param("receiverId") Long receiverId);

    int logicalDelete(@Param("id") Long id, @Param("receiverId") Long receiverId);
}
