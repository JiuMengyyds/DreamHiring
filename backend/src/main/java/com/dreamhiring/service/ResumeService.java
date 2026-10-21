package com.dreamhiring.service;

import com.dreamhiring.dto.ResumeRequests.ResumeUpsertRequest;
import com.dreamhiring.vo.ResumeView;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ResumeService {

    List<ResumeView> listMine();

    ResumeView create(ResumeUpsertRequest request);

    ResumeView detail(Long resumeId);

    ResumeView update(Long resumeId, ResumeUpsertRequest request);

    void delete(Long resumeId);

    ResumeView setDefault(Long resumeId);

    ResumeView uploadAttachment(Long resumeId, MultipartFile file);
}
