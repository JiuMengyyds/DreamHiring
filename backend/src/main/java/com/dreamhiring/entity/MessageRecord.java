package com.dreamhiring.entity;

import com.dreamhiring.entity.DomainEnums.MessageType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageRecord {

    private Long id;
    private Long receiverId;
    private MessageType type;
    private String title;
    private String content;
    private Long relatedId;
    private String dedupKey;
    private Integer isRead;
    private LocalDateTime createTime;
    private Integer deleted;
}
