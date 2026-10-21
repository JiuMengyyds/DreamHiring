package com.dreamhiring.mapper;

import com.dreamhiring.entity.ResumeEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ResumeMapper {

    List<ResumeEntity> findByUserId(@Param("userId") Long userId);

    ResumeEntity findById(@Param("id") Long id);

    ResumeEntity findDefaultByUserId(@Param("userId") Long userId);

    int insert(ResumeEntity resume);

    int update(ResumeEntity resume);

    int logicalDelete(@Param("id") Long id,
                      @Param("userId") Long userId,
                      @Param("updateTime") LocalDateTime updateTime);

    int resetDefault(@Param("userId") Long userId,
                     @Param("updateTime") LocalDateTime updateTime);

    int setDefault(@Param("id") Long id,
                   @Param("userId") Long userId,
                   @Param("updateTime") LocalDateTime updateTime);

    int updateAttachment(@Param("id") Long id,
                         @Param("userId") Long userId,
                         @Param("objectKey") String objectKey,
                         @Param("updateTime") LocalDateTime updateTime);
}
