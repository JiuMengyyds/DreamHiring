package com.dreamhiring.mapper;

import com.dreamhiring.entity.CompanyEntity;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface CompanyMapper {

    CompanyEntity findById(@Param("id") Long id);

    CompanyEntity findByUserId(@Param("userId") Long userId);

    List<CompanyEntity> findAll(@Param("keyword") String keyword,
                                @Param("auditStatus") String auditStatus);

    int insert(CompanyEntity company);

    int update(CompanyEntity company);

    int updateAuditStatus(@Param("id") Long id,
                          @Param("auditStatus") String auditStatus,
                          @Param("auditReason") String auditReason,
                          @Param("updateTime") java.time.LocalDateTime updateTime);
}
