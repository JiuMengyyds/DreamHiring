package com.dreamhiring.mapper;

import com.dreamhiring.entity.Announcement;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface AnnouncementMapper {

    List<Announcement> findPublished();

    List<Announcement> findAll(@Param("status") String status,
                               @Param("keyword") String keyword);

    Announcement findById(@Param("id") Long id);

    int insert(Announcement announcement);

    int update(Announcement announcement);

    int logicalDelete(@Param("id") Long id,
                      @Param("updateTime") java.time.LocalDateTime updateTime);
}
