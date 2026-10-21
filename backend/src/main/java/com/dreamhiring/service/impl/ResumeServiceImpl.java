package com.dreamhiring.service.impl;

import com.dreamhiring.common.BusinessException;
import com.dreamhiring.common.ResultCode;
import com.dreamhiring.dto.ResumeRequests.ResumeUpsertRequest;
import com.dreamhiring.entity.ResumeEntity;
import com.dreamhiring.mapper.ResumeMapper;
import com.dreamhiring.security.SecurityPrincipal;
import com.dreamhiring.service.FileService;
import com.dreamhiring.service.ResumeService;
import com.dreamhiring.util.SkillTagUtils;
import com.dreamhiring.vo.FileView;
import com.dreamhiring.vo.ResumeView;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ResumeServiceImpl implements ResumeService {

    private final ResumeMapper resumeMapper;
    private final FileService fileService;

    public ResumeServiceImpl(ResumeMapper resumeMapper, FileService fileService) {
        this.resumeMapper = resumeMapper;
        this.fileService = fileService;
    }

    @Override
    public List<ResumeView> listMine() {
        SecurityPrincipal principal = AuthServiceImpl.requirePrincipal();
        return resumeMapper.findByUserId(principal.id()).stream()
                .map(this::toView)
                .toList();
    }

    @Override
    @Transactional
    public ResumeView create(ResumeUpsertRequest request) {
        SecurityPrincipal principal = AuthServiceImpl.requirePrincipal();
        LocalDateTime now = LocalDateTime.now();
        boolean firstResume = resumeMapper.findByUserId(principal.id()).isEmpty();
        ResumeEntity resume = fromRequest(request, principal.id(), now);
        resume.setIsDefault(firstResume ? 1 : 0);
        resumeMapper.insert(resume);
        return toView(resume);
    }

    @Override
    public ResumeView detail(Long resumeId) {
        SecurityPrincipal principal = AuthServiceImpl.requirePrincipal();
        return toView(findOwned(resumeId, principal.id()));
    }

    @Override
    @Transactional
    public ResumeView update(Long resumeId, ResumeUpsertRequest request) {
        SecurityPrincipal principal = AuthServiceImpl.requirePrincipal();
        ResumeEntity existing = findOwned(resumeId, principal.id());
        ResumeEntity updated = fromRequest(request, principal.id(), existing.getCreateTime());
        updated.setId(existing.getId());
        updated.setIsDefault(existing.getIsDefault());
        updated.setAttachmentObjectKey(existing.getAttachmentObjectKey());
        updated.setUpdateTime(LocalDateTime.now());
        resumeMapper.update(updated);
        return toView(updated);
    }

    @Override
    @Transactional
    public void delete(Long resumeId) {
        SecurityPrincipal principal = AuthServiceImpl.requirePrincipal();
        ResumeEntity resume = findOwned(resumeId, principal.id());
        resumeMapper.logicalDelete(resumeId, principal.id(), LocalDateTime.now());
        fileService.deleteAfterCommit(resume.getAttachmentObjectKey());
        if (resume.getIsDefault() == 1) {
            List<ResumeEntity> remaining = resumeMapper.findByUserId(principal.id());
            if (!remaining.isEmpty()) {
                resumeMapper.setDefault(remaining.getFirst().getId(), principal.id(), LocalDateTime.now());
            }
        }
    }

    @Override
    @Transactional
    public ResumeView setDefault(Long resumeId) {
        SecurityPrincipal principal = AuthServiceImpl.requirePrincipal();
        ResumeEntity resume = findOwned(resumeId, principal.id());
        LocalDateTime now = LocalDateTime.now();
        resumeMapper.resetDefault(principal.id(), now);
        resumeMapper.setDefault(resumeId, principal.id(), now);
        resume.setIsDefault(1);
        return toView(resume);
    }

    @Override
    @Transactional
    public ResumeView uploadAttachment(Long resumeId, MultipartFile file) {
        SecurityPrincipal principal = AuthServiceImpl.requirePrincipal();
        ResumeEntity resume = findOwned(resumeId, principal.id());
        String previousObjectKey = resume.getAttachmentObjectKey();
        FileView uploaded = fileService.upload("RESUME_ATTACHMENT", file);
        resumeMapper.updateAttachment(resumeId, principal.id(), uploaded.objectKey(), LocalDateTime.now());
        resume.setAttachmentObjectKey(uploaded.objectKey());
        resume.setUpdateTime(LocalDateTime.now());
        if (!uploaded.objectKey().equals(previousObjectKey)) {
            fileService.deleteAfterCommit(previousObjectKey);
        }
        return toView(resume);
    }

    private ResumeEntity findOwned(Long resumeId, Long userId) {
        ResumeEntity resume = resumeMapper.findById(resumeId);
        if (resume == null || !resume.getUserId().equals(userId)) {
            throw new BusinessException(ResultCode.NOT_FOUND, "简历不存在或已删除");
        }
        return resume;
    }

    private ResumeEntity fromRequest(ResumeUpsertRequest request, Long userId, LocalDateTime createTime) {
        LocalDateTime now = LocalDateTime.now();
        return ResumeEntity.builder()
                .userId(userId)
                .name(request.name())
                .title(request.title())
                .education(request.education())
                .experienceYears(request.experienceYears())
                .currentCity(request.currentCity())
                .expectCity(request.expectCity())
                .expectSalaryMin(request.expectSalaryMin())
                .expectSalaryMax(request.expectSalaryMax())
                .skillTags(SkillTagUtils.join(request.skillTags()))
                .summary(request.summary())
                .createTime(createTime == null ? now : createTime)
                .updateTime(now)
                .deleted(0)
                .build();
    }

    private ResumeView toView(ResumeEntity resume) {
        return new ResumeView(
                resume.getId(),
                resume.getUserId(),
                resume.getName(),
                resume.getTitle(),
                resume.getEducation(),
                resume.getExperienceYears(),
                resume.getCurrentCity(),
                resume.getExpectCity(),
                resume.getExpectSalaryMin(),
                resume.getExpectSalaryMax(),
                SkillTagUtils.split(resume.getSkillTags()),
                resume.getSummary(),
                resume.getAttachmentObjectKey(),
                fileService.attachmentUrl(resume.getAttachmentObjectKey()),
                resume.getIsDefault() != null && resume.getIsDefault() == 1,
                resume.getCreateTime(),
                resume.getUpdateTime()
        );
    }
}
