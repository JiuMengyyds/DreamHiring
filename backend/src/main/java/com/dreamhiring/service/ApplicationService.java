package com.dreamhiring.service;

import com.dreamhiring.common.PageVO;
import com.dreamhiring.dto.ApplicationRequests.CreateRequest;
import com.dreamhiring.dto.ApplicationRequests.StatusRequest;
import com.dreamhiring.vo.ApplicationViews.ApplicationDetailView;
import com.dreamhiring.vo.ApplicationViews.ApplicationView;

public interface ApplicationService {

    ApplicationView create(CreateRequest request);

    PageVO<ApplicationView> mine(String status, int page, int size);

    ApplicationDetailView myDetail(Long applicationId);

    PageVO<ApplicationDetailView> companyList(Long jobId, String status, String keyword, int page, int size);

    ApplicationDetailView companyDetail(Long applicationId);

    ApplicationView updateStatus(Long applicationId, StatusRequest request);

    ApplicationView updateRemark(Long applicationId, String remark);
}
