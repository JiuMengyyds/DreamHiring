package com.dreamhiring.mapper;

import com.dreamhiring.entity.JobCategory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface JobCategoryMapper {

    List<JobCategory> findAll();

    JobCategory findById(@Param("id") Long id);

    int countChildren(@Param("parentId") Long parentId);

    int insert(JobCategory category);

    int update(JobCategory category);

    int logicalDelete(@Param("id") Long id);
}
