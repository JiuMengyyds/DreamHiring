package com.dreamhiring.service.impl;

import com.dreamhiring.common.BusinessException;
import com.dreamhiring.common.PageVO;
import com.dreamhiring.common.ResultCode;
import com.dreamhiring.dto.ApplicationRequests.CreateRequest;
import com.dreamhiring.dto.ApplicationRequests.StatusRequest;
import com.dreamhiring.entity.ApplicationRecord;
import com.dreamhiring.entity.CompanyEntity;
import com.dreamhiring.entity.DomainEnums.ApplicationStatus;
import com.dreamhiring.entity.JobEntity;
import com.dreamhiring.entity.ResumeEntity;
import com.dreamhiring.entity.UserAccount;
import com.dreamhiring.mapper.ApplicationMapper;
import com.dreamhiring.mapper.CompanyMapper;
import com.dreamhiring.mapper.JobMapper;
import com.dreamhiring.mapper.ResumeMapper;
import com.dreamhiring.mapper.UserMapper;
import com.dreamhiring.messaging.ApplicationStatusChangedEvent;
import com.dreamhiring.messaging.NotificationGateway;
import com.dreamhiring.security.SecurityPrincipal;
import com.dreamhiring.service.ApplicationService;
import com.dreamhiring.service.FileService;
import com.dreamhiring.util.SkillTagUtils;
import com.dreamhiring.vo.ApplicationViews.ApplicationDetailView;
import com.dreamhiring.vo.ApplicationViews.ApplicationView;
import com.dreamhiring.vo.AuthViews.UserView;
import com.dreamhiring.vo.JobViews.JobSummary;
import com.dreamhiring.vo.ResumeView;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;

@Service
public class ApplicationServiceImpl implements ApplicationService {

    private static final Map<ApplicationStatus, EnumSet<ApplicationStatus>> TRANSITIONS = Map.of(
            ApplicationStatus.PENDING_VIEW,
            EnumSet.of(ApplicationStatus.VIEWED, ApplicationStatus.INTERVIEW, ApplicationStatus.REJECTED),
            ApplicationStatus.VIEWED,
            EnumSet.of(ApplicationStatus.INTERVIEW, ApplicationStatus.REJECTED),
            ApplicationStatus.INTERVIEW,
            EnumSet.of(ApplicationStatus.REJECTED),
            ApplicationStatus.REJECTED,
            EnumSet.noneOf(ApplicationStatus.class)
    );

    private final ApplicationMapper applicationMapper;
    private final ResumeMapper resumeMapper;
    private final JobMapper jobMapper;
    private final CompanyMapper companyMapper;
    private final UserMapper userMapper;
    private final FileService fileService;
    private final NotificationGateway notificationGateway;

    public ApplicationServiceImpl(
            ApplicationMapper applicationMapper,
            ResumeMapper resumeMapper,
            JobMapper jobMapper,
            CompanyMapper companyMapper,
            UserMapper userMapper,
            FileService fileService,
            NotificationGateway notificationGateway
    ) {
        this.applicationMapper = applicationMapper;
        this.resumeMapper = resumeMapper;
        this.jobMapper = jobMapper;
        this.companyMapper = companyMapper;
        this.userMapper = userMapper;
        this.fileService = fileService;
        this.notificationGateway = notificationGateway;
    }

    @Override
    @Transactional
    public ApplicationView create(CreateRequest request) {
        SecurityPrincipal principal = AuthServiceImpl.requirePrincipal();
        ResumeEntity resume = resumeMapper.findById(request.resumeId());
        if (resume == null || !resume.getUserId().equals(principal.id())) {
            throw new BusinessException(ResultCode.NOT_FOUND, "简历不存在或已删除");
        }
        JobEntity job = jobMapper.findById(request.jobId());
        if (job == null || job.getStatus() != com.dreamhiring.entity.DomainEnums.JobStatus.PUBLISHED) {
            throw new BusinessException(ResultCode.UNPROCESSABLE_ENTITY, "职位当前不可投递");
        }
        if (applicationMapper.countByResumeAndJob(resume.getId(), job.getId()) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "你已经投递过该职位");
        }
        int matchScore = calculateMatch(job, resume);
        ApplicationRecord application = ApplicationRecord.builder()
                .resumeId(resume.getId())
                .jobId(job.getId())
                .userId(principal.id())
                .status(ApplicationStatus.PENDING_VIEW)
                .matchScore(matchScore)
                .companyRemark("")
                .deliveryTime(LocalDateTime.now())
                .deleted(0)
                .build();
        applicationMapper.insert(application);
        return toView(application, job);
    }

    @Override
    public PageVO<ApplicationView> mine(String status, int page, int size) {
        SecurityPrincipal principal = AuthServiceImpl.requirePrincipal();
        PageHelper.startPage(page, size);
        Page<ApplicationRecord> applications = (Page<ApplicationRecord>) applicationMapper.findByUserId(principal.id(), status);
        List<ApplicationView> records = applications.stream()
                .map(application -> toView(application, jobMapper.findById(application.getJobId())))
                .toList();
        return PageVO.of(records, applications.getTotal(), page, size);
    }

    @Override
    public ApplicationDetailView myDetail(Long applicationId) {
        SecurityPrincipal principal = AuthServiceImpl.requirePrincipal();
        ApplicationRecord application = applicationMapper.findById(applicationId);
        if (application == null || !application.getUserId().equals(principal.id())) {
            throw new BusinessException(ResultCode.NOT_FOUND, "投递记录不存在");
        }
        return toDetail(application, null);
    }

    @Override
    public PageVO<ApplicationDetailView> companyList(Long jobId, String status, String keyword, int page, int size) {
        Long companyId = currentCompanyId();
        PageHelper.startPage(page, size);
        Page<ApplicationRecord> applications =
                (Page<ApplicationRecord>) applicationMapper.findByCompanyId(companyId, jobId, status, keyword);
        List<ApplicationDetailView> records = applications.stream()
                .map(application -> toDetail(application, companyId))
                .toList();
        return PageVO.of(records, applications.getTotal(), page, size);
    }

    @Override
    public ApplicationDetailView companyDetail(Long applicationId) {
        Long companyId = currentCompanyId();
        ApplicationRecord application = applicationMapper.findById(applicationId);
        requireCompanyApplication(application, companyId);
        return toDetail(application, companyId);
    }

    @Override
    @Transactional
    public ApplicationView updateStatus(Long applicationId, StatusRequest request) {
        Long companyId = currentCompanyId();
        ApplicationRecord application = applicationMapper.findById(applicationId);
        requireCompanyApplication(application, companyId);
        if (!TRANSITIONS.getOrDefault(application.getStatus(), EnumSet.noneOf(ApplicationStatus.class))
                .contains(request.status())) {
            throw new BusinessException(ResultCode.CONFLICT, "当前状态不允许该流转");
        }
        applicationMapper.updateStatus(
                applicationId,
                request.status().name(),
                request.remark(),
                LocalDateTime.now()
        );
        application.setStatus(request.status());
        application.setCompanyRemark(request.remark());
        application.setHandleTime(LocalDateTime.now());
        JobEntity job = jobMapper.findById(application.getJobId());
        if (request.status() == ApplicationStatus.INTERVIEW
                || request.status() == ApplicationStatus.REJECTED) {
            notificationGateway.publishApplicationStatusChanged(new ApplicationStatusChangedEvent(
                    application.getUserId(),
                    application.getId(),
                    job.getTitle(),
                    request.status()
            ));
        }
        return toView(application, job);
    }

    @Override
    public ApplicationView updateRemark(Long applicationId, String remark) {
        Long companyId = currentCompanyId();
        ApplicationRecord application = applicationMapper.findById(applicationId);
        requireCompanyApplication(application, companyId);
        applicationMapper.updateRemark(applicationId, remark);
        application.setCompanyRemark(remark);
        return toView(application, jobMapper.findById(application.getJobId()));
    }

    private Long currentCompanyId() {
        SecurityPrincipal principal = AuthServiceImpl.requirePrincipal();
        CompanyEntity company = companyMapper.findByUserId(principal.id());
        if (company == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "企业资料不存在");
        }
        return company.getId();
    }

    private void requireCompanyApplication(ApplicationRecord application, Long companyId) {
        if (application == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "投递记录不存在");
        }
        JobEntity job = jobMapper.findById(application.getJobId());
        if (job == null || !job.getCompanyId().equals(companyId)) {
            throw new BusinessException(ResultCode.FORBIDDEN, "无权访问该投递");
        }
    }

    private ApplicationView toView(ApplicationRecord application, JobEntity job) {
        return new ApplicationView(
                application.getId(),
                application.getResumeId(),
                application.getJobId(),
                application.getUserId(),
                application.getStatus(),
                application.getMatchScore(),
                application.getCompanyRemark(),
                application.getDeliveryTime(),
                application.getHandleTime(),
                toJobSummary(job)
        );
    }

    private ApplicationDetailView toDetail(ApplicationRecord application, Long expectedCompanyId) {
        JobEntity job = jobMapper.findById(application.getJobId());
        if (expectedCompanyId != null && (job == null || !job.getCompanyId().equals(expectedCompanyId))) {
            throw new BusinessException(ResultCode.FORBIDDEN, "无权访问该投递");
        }
        ResumeEntity resume = resumeMapper.findById(application.getResumeId());
        UserAccount candidate = userMapper.findById(application.getUserId());
        return new ApplicationDetailView(
                application.getId(),
                application.getResumeId(),
                application.getJobId(),
                application.getUserId(),
                application.getStatus(),
                application.getMatchScore(),
                application.getCompanyRemark(),
                application.getDeliveryTime(),
                application.getHandleTime(),
                toJobSummary(job),
                toResumeView(resume),
                toUserView(candidate)
        );
    }

    private JobSummary toJobSummary(JobEntity job) {
        if (job == null) {
            return null;
        }
        CompanyEntity company = companyMapper.findById(job.getCompanyId());
        return new JobSummary(
                job.getId(),
                job.getCompanyId(),
                company == null ? "" : company.getName(),
                company == null ? null : company.getLogoUrl(),
                job.getTitle(),
                job.getCity(),
                job.getDistrict(),
                job.getSalaryMin(),
                job.getSalaryMax(),
                job.getEducation(),
                job.getExperience(),
                company == null ? "" : company.getIndustry(),
                SkillTagUtils.split(job.getSkillTags()),
                SkillTagUtils.split(job.getPerks()),
                job.getStatus(),
                job.getViewCount(),
                null,
                job.getUpdateTime()
        );
    }

    private ResumeView toResumeView(ResumeEntity resume) {
        if (resume == null) {
            return null;
        }
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

    private UserView toUserView(UserAccount user) {
        if (user == null) {
            return null;
        }
        return new UserView(
                user.getId(),
                user.getUsername(),
                user.getNickname(),
                user.getRole(),
                user.getStatus(),
                user.getPhone(),
                user.getEmail(),
                user.getAvatarUrl()
        );
    }

    private int calculateMatch(JobEntity job, ResumeEntity resume) {
        List<String> jobSkills = SkillTagUtils.split(job.getSkillTags());
        if (jobSkills.isEmpty()) {
            return 0;
        }
        List<String> matched = new ArrayList<>(jobSkills);
        matched.retainAll(SkillTagUtils.split(resume.getSkillTags()));
        return Math.round(matched.size() * 100f / jobSkills.size());
    }

}
