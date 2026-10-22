package com.dreamhiring.mapper;

import com.dreamhiring.dto.JobQuery;
import com.dreamhiring.entity.JobEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface JobMapper {

    List<JobEntity> search(JobQuery query);

    List<JobEntity> hot(@Param("limit") int limit);

    List<JobEntity> findPublishedByIds(@Param("ids") List<Long> ids);

    List<JobEntity> findByCompanyId(@Param("companyId") Long companyId);

    List<JobEntity> findCompanyJobsPage(@Param("companyId") Long companyId,
                                        @Param("status") String status,
                                        @Param("auditStatus") String auditStatus,
                                        @Param("keyword") String keyword);

    List<JobEntity> findAllForAdmin(@Param("keyword") String keyword,
                                    @Param("status") String status,
                                    @Param("auditStatus") String auditStatus);

    JobEntity findById(@Param("id") Long id);

    int insert(JobEntity job);

    int update(JobEntity job);

    int updateStatus(@Param("id") Long id,
                     @Param("status") String status,
                     @Param("publishTime") LocalDateTime publishTime,
                     @Param("updateTime") LocalDateTime updateTime);

    int audit(@Param("id") Long id,
              @Param("auditStatus") String auditStatus,
              @Param("auditReason") String auditReason,
              @Param("status") String status,
              @Param("publishTime") LocalDateTime publishTime,
              @Param("updateTime") LocalDateTime updateTime);

    int incrementViewCount(@Param("id") Long id);

    int logicalDelete(@Param("id") Long id,
                      @Param("companyId") Long companyId,
                      @Param("updateTime") LocalDateTime updateTime);

    int countByCategoryId(@Param("categoryId") Long categoryId);

    int countPublishedByCategoryId(@Param("categoryId") Long categoryId);
}
