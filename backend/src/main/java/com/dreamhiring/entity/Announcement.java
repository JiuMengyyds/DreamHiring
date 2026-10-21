package com.dreamhiring.entity;

import com.dreamhiring.entity.DomainEnums.AnnouncementChannel;
import com.dreamhiring.entity.DomainEnums.AnnouncementStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Announcement {

    private Long id;
    private String title;
    private String summary;
    private String content;
    private AnnouncementChannel channel;
    private AnnouncementStatus status;
    private Long publisherId;
    private LocalDateTime publishTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer deleted;
}
