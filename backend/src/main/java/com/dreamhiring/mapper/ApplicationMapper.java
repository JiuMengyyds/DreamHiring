package com.dreamhiring.mapper;

import com.dreamhiring.entity.ApplicationRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDateTime;
import java.util.List;

@Mapper
public interface ApplicationMapper {

    int countByResumeAndJob(@Param("resumeId") Long resumeId,
                            @Param("jobId") Long jobId);

    int insert(ApplicationRecord application);

    List<ApplicationRecord> findByUserId(@Param("userId") Long userId,
                                         @Param("status") String status);

    List<ApplicationRecord> findByCompanyId(@Param("companyId") Long companyId,
                                            @Param("jobId") Long jobId,
                                            @Param("status") String status,
                                            @Param("keyword") String keyword);

    ApplicationRecord findById(@Param("id") Long id);

    int updateStatus(@Param("id") Long id,
                     @Param("status") String status,
                     @Param("remark") String remark,
                     @Param("handleTime") LocalDateTime handleTime);

    int updateRemark(@Param("id") Long id,
                     @Param("remark") String remark);
}
