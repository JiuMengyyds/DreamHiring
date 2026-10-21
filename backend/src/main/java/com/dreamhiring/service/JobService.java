package com.dreamhiring.service;

import com.dreamhiring.common.PageVO;
import com.dreamhiring.dto.JobQuery;
import com.dreamhiring.vo.JobViews.CategoryNode;
import com.dreamhiring.vo.JobViews.JobDetail;
import com.dreamhiring.vo.JobViews.JobSummary;

import java.util.List;

public interface JobService {

    PageVO<JobSummary> search(JobQuery query, int page, int size);

    List<JobSummary> hot(int limit);

    JobDetail detail(Long jobId);

    List<CategoryNode> categoryTree();
}
