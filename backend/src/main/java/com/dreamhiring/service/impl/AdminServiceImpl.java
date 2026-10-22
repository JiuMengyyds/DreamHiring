package com.dreamhiring.service.impl;

import com.dreamhiring.common.BusinessException;
import com.dreamhiring.common.PageRequest;
import com.dreamhiring.common.PageVO;
import com.dreamhiring.common.ResultCode;
import com.dreamhiring.dto.AdminRequests.AnnouncementUpsertRequest;
import com.dreamhiring.dto.AdminRequests.AuditRequest;
import com.dreamhiring.dto.AdminRequests.CategoryUpsertRequest;
import com.dreamhiring.dto.AdminRequests.UserStatusRequest;
import com.dreamhiring.entity.Announcement;
import com.dreamhiring.entity.CompanyEntity;
import com.dreamhiring.entity.DomainEnums.AuditStatus;
import com.dreamhiring.entity.DomainEnums.CompanyAuditStatus;
import com.dreamhiring.entity.DomainEnums.JobStatus;
import com.dreamhiring.entity.JobCategory;
import com.dreamhiring.entity.JobEntity;
import com.dreamhiring.entity.UserAccount;
import com.dreamhiring.mapper.AnnouncementMapper;
import com.dreamhiring.mapper.ApplicationMapper;
import com.dreamhiring.mapper.CompanyMapper;
import com.dreamhiring.mapper.JobCategoryMapper;
import com.dreamhiring.mapper.JobMapper;
import com.dreamhiring.mapper.MessageMapper;
import com.dreamhiring.mapper.ResumeMapper;
import com.dreamhiring.mapper.UserMapper;
import com.dreamhiring.messaging.AnnouncementPublishedEvent;
import com.dreamhiring.messaging.NotificationGateway;
import com.dreamhiring.security.SecurityPrincipal;
import com.dreamhiring.service.AdminService;
import com.dreamhiring.service.FileService;
import com.dreamhiring.util.SkillTagUtils;
import com.dreamhiring.vo.AnnouncementView;
import com.dreamhiring.vo.AuthViews.UserProfileView;
import com.dreamhiring.vo.CompanyViews.CompanyJobView;
import com.dreamhiring.vo.CompanyViews.CompanyView;
import com.dreamhiring.vo.JobViews.CompanyBrief;
import com.dreamhiring.vo.JobViews.CategoryNode;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminServiceImpl implements AdminService {

    private final UserMapper userMapper;
    private final CompanyMapper companyMapper;
    private final JobMapper jobMapper;
    private final ApplicationMapper applicationMapper;
    private final ResumeMapper resumeMapper;
    private final MessageMapper messageMapper;
    private final JobCategoryMapper categoryMapper;
    private final AnnouncementMapper announcementMapper;
    private final NotificationGateway notificationGateway;
    private final FileService fileService;

    public AdminServiceImpl(
            UserMapper userMapper,
            CompanyMapper companyMapper,
            JobMapper jobMapper,
            ApplicationMapper applicationMapper,
            ResumeMapper resumeMapper,
            MessageMapper messageMapper,
            JobCategoryMapper categoryMapper,
            AnnouncementMapper announcementMapper,
            NotificationGateway notificationGateway,
            FileService fileService
    ) {
        this.userMapper = userMapper;
        this.companyMapper = companyMapper;
        this.jobMapper = jobMapper;
        this.applicationMapper = applicationMapper;
        this.resumeMapper = resumeMapper;
        this.messageMapper = messageMapper;
        this.categoryMapper = categoryMapper;
        this.announcementMapper = announcementMapper;
        this.notificationGateway = notificationGateway;
        this.fileService = fileService;
    }

    @Override
    public PageVO<UserProfileView> listUsers(String keyword, String role, String status, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        PageHelper.startPage(pageRequest.page(), pageRequest.size());
        Page<UserAccount> users = (Page<UserAccount>) userMapper.findAll(keyword, role, status);
        List<UserProfileView> records = users.stream()
                .map(user -> AuthServiceImpl.toProfile(user, fileService))
                .toList();
        return PageVO.of(records, users.getTotal(), pageRequest.page(), pageRequest.size());
    }

    @Override
    public UserProfileView userDetail(Long userId) {
        return AuthServiceImpl.toProfile(requireUser(userId), fileService);
    }

    @Override
    @Transactional
    public UserProfileView updateUserStatus(Long userId, UserStatusRequest request) {
        UserAccount user = requireUser(userId);
        userMapper.updateStatus(userId, request.status().name(), LocalDateTime.now());
        user.setStatus(request.status());
        return AuthServiceImpl.toProfile(user, fileService);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        UserAccount user = requireUser(userId);
        boolean hasRelations = !resumeMapper.findByUserId(userId).isEmpty()
                || !applicationMapper.findByUserId(userId, null).isEmpty()
                || companyMapper.findByUserId(userId) != null
                || messageMapper.countByReceiver(userId) > 0;
        if (hasRelations) {
            throw new BusinessException(ResultCode.CONFLICT, "该账号存在业务数据，请改用禁用账号");
        }
        userMapper.logicalDelete(user.getId(), LocalDateTime.now());
    }

    @Override
    public PageVO<CompanyView> listCompanies(String keyword, String auditStatus, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        PageHelper.startPage(pageRequest.page(), pageRequest.size());
        Page<CompanyEntity> companies = (Page<CompanyEntity>) companyMapper.findAll(keyword, auditStatus);
        List<CompanyView> records = companies.stream().map(this::toCompanyView).toList();
        return PageVO.of(records, companies.getTotal(), pageRequest.page(), pageRequest.size());
    }

    @Override
    public CompanyView companyDetail(Long companyId) {
        return toCompanyView(requireCompany(companyId));
    }

    @Override
    @Transactional
    public CompanyView auditCompany(Long companyId, AuditRequest request) {
        CompanyEntity company = requireCompany(companyId);
        if (request.auditStatus() != AuditStatus.APPROVED && request.auditStatus() != AuditStatus.REJECTED) {
            throw new BusinessException(ResultCode.UNPROCESSABLE_ENTITY, "企业审核仅支持通过或驳回");
        }
        if (request.auditStatus() == AuditStatus.REJECTED
                && (request.reason() == null || request.reason().isBlank())) {
            throw new BusinessException(ResultCode.UNPROCESSABLE_ENTITY, "驳回时必须填写原因");
        }
        CompanyAuditStatus status = request.auditStatus() == AuditStatus.APPROVED
                ? CompanyAuditStatus.APPROVED : CompanyAuditStatus.REJECTED;
        companyMapper.updateAuditStatus(
                companyId,
                status.name(),
                request.reason(),
                LocalDateTime.now()
        );
        company.setAuditStatus(status);
        company.setAuditReason(request.reason());
        return toCompanyView(company);
    }

    @Override
    public PageVO<CompanyJobView> listJobs(String keyword, String status, String auditStatus, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        PageHelper.startPage(pageRequest.page(), pageRequest.size());
        Page<JobEntity> jobs = (Page<JobEntity>) jobMapper.findAllForAdmin(keyword, status, auditStatus);
        List<CompanyJobView> records = jobs.stream().map(this::toJobView).toList();
        return PageVO.of(records, jobs.getTotal(), pageRequest.page(), pageRequest.size());
    }

    @Override
    public CompanyJobView jobDetail(Long jobId) {
        return toJobView(requireJob(jobId));
    }

    @Override
    @Transactional
    public CompanyJobView auditJob(Long jobId, AuditRequest request) {
        JobEntity job = requireJob(jobId);
        if (request.auditStatus() != AuditStatus.APPROVED
                && request.auditStatus() != AuditStatus.REJECTED) {
            throw new BusinessException(ResultCode.UNPROCESSABLE_ENTITY, "职位审核仅支持通过或驳回");
        }
        if (request.auditStatus() == AuditStatus.REJECTED
                && (request.reason() == null || request.reason().isBlank())) {
            throw new BusinessException(ResultCode.UNPROCESSABLE_ENTITY, "驳回时必须填写原因");
        }
        if (request.auditStatus() == AuditStatus.APPROVED) {
            CompanyEntity company = companyMapper.findById(job.getCompanyId());
            if (company == null || company.getAuditStatus() != CompanyAuditStatus.APPROVED) {
                throw new BusinessException(ResultCode.CONFLICT, "企业认证通过后才能发布职位");
            }
        }
        JobStatus status = request.auditStatus() == AuditStatus.APPROVED
                ? JobStatus.PUBLISHED : job.getStatus();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime publishTime = status == JobStatus.PUBLISHED
                ? job.getPublishTime() == null ? now : job.getPublishTime()
                : job.getPublishTime();
        jobMapper.audit(
                jobId,
                request.auditStatus().name(),
                request.reason(),
                status.name(),
                publishTime,
                now
        );
        job.setAuditStatus(request.auditStatus());
        job.setAuditReason(request.reason());
        job.setStatus(status);
        job.setPublishTime(publishTime);
        job.setUpdateTime(now);
        return toJobView(job);
    }

    @Override
    @Transactional
    public CategoryNode createCategory(CategoryUpsertRequest request) {
        validateCategoryParent(request.parentId(), null);
        JobCategory category = JobCategory.builder()
                .name(request.name())
                .parentId(request.parentId())
                .sort(request.sort())
                .deleted(0)
                .build();
        categoryMapper.insert(category);
        return toCategoryNode(category);
    }

    @Override
    @Transactional
    public CategoryNode updateCategory(Long categoryId, CategoryUpsertRequest request) {
        JobCategory category = requireCategory(categoryId);
        validateCategoryParent(request.parentId(), categoryId);
        category.setName(request.name());
        category.setParentId(request.parentId());
        category.setSort(request.sort());
        categoryMapper.update(category);
        return toCategoryNode(category);
    }

    @Override
    @Transactional
    public void deleteCategory(Long categoryId) {
        requireCategory(categoryId);
        if (categoryMapper.countChildren(categoryId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "CATEGORY_HAS_CHILDREN");
        }
        if (jobMapper.countByCategoryId(categoryId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "CATEGORY_IN_USE");
        }
        categoryMapper.logicalDelete(categoryId);
    }

    @Override
    public PageVO<AnnouncementView> listAnnouncements(String keyword, String status, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        PageHelper.startPage(pageRequest.page(), pageRequest.size());
        Page<Announcement> announcements =
                (Page<Announcement>) announcementMapper.findAll(status, keyword);
        List<AnnouncementView> records = announcements.stream()
                .map(AnnouncementServiceImpl::toView)
                .toList();
        return PageVO.of(records, announcements.getTotal(), pageRequest.page(), pageRequest.size());
    }

    @Override
    @Transactional
    public AnnouncementView createAnnouncement(AnnouncementUpsertRequest request) {
        SecurityPrincipal principal = AuthServiceImpl.requirePrincipal();
        LocalDateTime now = LocalDateTime.now();
        Announcement announcement = fromRequest(request);
        announcement.setPublisherId(principal.id());
        announcement.setCreateTime(now);
        announcement.setUpdateTime(now);
        announcement.setPublishTime(
                request.status() == com.dreamhiring.entity.DomainEnums.AnnouncementStatus.PUBLISHED ? now : null);
        announcement.setDeleted(0);
        announcementMapper.insert(announcement);
        publishAnnouncementIfNeeded(announcement);
        return AnnouncementServiceImpl.toView(announcement);
    }

    @Override
    @Transactional
    public AnnouncementView updateAnnouncement(Long announcementId, AnnouncementUpsertRequest request) {
        Announcement announcement = requireAnnouncement(announcementId);
        boolean wasPublished = announcement.getStatus()
                == com.dreamhiring.entity.DomainEnums.AnnouncementStatus.PUBLISHED;
        Announcement updated = fromRequest(request);
        updated.setId(announcementId);
        updated.setPublisherId(announcement.getPublisherId());
        updated.setCreateTime(announcement.getCreateTime());
        updated.setUpdateTime(LocalDateTime.now());
        updated.setPublishTime(
                request.status() == com.dreamhiring.entity.DomainEnums.AnnouncementStatus.PUBLISHED
                        ? announcement.getPublishTime() == null ? LocalDateTime.now() : announcement.getPublishTime()
                        : null);
        announcementMapper.update(updated);
        if (!wasPublished) {
            publishAnnouncementIfNeeded(updated);
        }
        return AnnouncementServiceImpl.toView(updated);
    }

    @Override
    @Transactional
    public void deleteAnnouncement(Long announcementId) {
        requireAnnouncement(announcementId);
        announcementMapper.logicalDelete(announcementId, LocalDateTime.now());
    }

    private Announcement fromRequest(AnnouncementUpsertRequest request) {
        return Announcement.builder()
                .title(request.title())
                .summary(request.summary())
                .content(request.content())
                .channel(request.channel())
                .status(request.status())
                .build();
    }

    private void publishAnnouncementIfNeeded(Announcement announcement) {
        if (announcement.getStatus() == com.dreamhiring.entity.DomainEnums.AnnouncementStatus.PUBLISHED) {
            notificationGateway.publishAnnouncementPublished(new AnnouncementPublishedEvent(
                    announcement.getId(),
                    announcement.getTitle(),
                    announcement.getSummary(),
                    announcement.getChannel()
            ));
        }
    }

    private UserAccount requireUser(Long id) {
        UserAccount user = userMapper.findById(id);
        if (user == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "用户不存在或已删除");
        }
        return user;
    }

    private CompanyEntity requireCompany(Long id) {
        CompanyEntity company = companyMapper.findById(id);
        if (company == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "企业不存在或已删除");
        }
        return company;
    }

    private JobEntity requireJob(Long id) {
        JobEntity job = jobMapper.findById(id);
        if (job == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "职位不存在或已删除");
        }
        return job;
    }

    private JobCategory requireCategory(Long id) {
        JobCategory category = categoryMapper.findById(id);
        if (category == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "分类不存在或已删除");
        }
        return category;
    }

    private void validateCategoryParent(Long parentId, Long categoryId) {
        if (parentId == null) {
            return;
        }
        if (parentId.equals(categoryId)) {
            throw new BusinessException(ResultCode.UNPROCESSABLE_ENTITY, "分类不能以自身作为父分类");
        }
        JobCategory parent = categoryMapper.findById(parentId);
        if (parent == null || parent.getParentId() != null) {
            throw new BusinessException(ResultCode.UNPROCESSABLE_ENTITY, "父分类不存在或不是一级分类");
        }
        if (categoryId != null && categoryMapper.countChildren(categoryId) > 0) {
            throw new BusinessException(ResultCode.UNPROCESSABLE_ENTITY, "存在子分类时不能改为二级分类");
        }
    }

    private Announcement requireAnnouncement(Long id) {
        Announcement announcement = announcementMapper.findById(id);
        if (announcement == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "公告不存在或已删除");
        }
        return announcement;
    }

    private CompanyView toCompanyView(CompanyEntity company) {
        int activeJobCount = (int) jobMapper.findByCompanyId(company.getId()).stream()
                .filter(job -> job.getStatus() == JobStatus.PUBLISHED)
                .count();
        return new CompanyView(
                company.getId(),
                company.getUserId(),
                company.getName(),
                company.getIndustry(),
                company.getScale(),
                company.getCity(),
                company.getLogoObjectKey(),
                fileService.publicUrl(company.getLogoObjectKey()),
                company.getIntro(),
                company.getContactName(),
                company.getContactPhone(),
                company.getContactEmail(),
                activeJobCount,
                company.getAuditStatus(),
                company.getAuditReason(),
                company.getCreateTime(),
                company.getUpdateTime()
        );
    }

    private CompanyJobView toJobView(JobEntity job) {
        List<com.dreamhiring.entity.ApplicationRecord> applications = applicationMapper.findByCompanyId(
                job.getCompanyId(), job.getId(), null, null);
        CompanyEntity company = companyMapper.findById(job.getCompanyId());
        int pendingApplicantCount = (int) applications.stream()
                .filter(application -> application.getStatus()
                        == com.dreamhiring.entity.DomainEnums.ApplicationStatus.PENDING_VIEW)
                .count();
        return new CompanyJobView(
                job.getId(),
                job.getCompanyId(),
                company == null ? "" : company.getName(),
                company == null ? null : fileService.publicUrl(company.getLogoObjectKey()),
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
                job.getUpdateTime(),
                job.getDescription(),
                SkillTagUtils.split(job.getDuties()),
                SkillTagUtils.split(job.getRequirements()),
                toCompanyBrief(company),
                null,
                job.getPublishTime(),
                job.getAuditStatus(),
                job.getAuditReason(),
                applications.size(),
                pendingApplicantCount,
                job.getCreateTime()
        );
    }

    private CompanyBrief toCompanyBrief(CompanyEntity company) {
        if (company == null) {
            return null;
        }
        return new CompanyBrief(
                company.getId(),
                company.getName(),
                company.getIndustry(),
                company.getScale(),
                company.getCity(),
                company.getLogoObjectKey(),
                fileService.publicUrl(company.getLogoObjectKey()),
                company.getAuditStatus()
        );
    }

    private CategoryNode toCategoryNode(JobCategory category) {
        return new CategoryNode(
                category.getId(),
                category.getName(),
                category.getParentId(),
                category.getSort(),
                jobMapper.countByCategoryId(category.getId()),
                List.of()
        );
    }
}
