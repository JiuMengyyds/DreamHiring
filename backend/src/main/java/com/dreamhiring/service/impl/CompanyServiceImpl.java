package com.dreamhiring.service.impl;

import com.dreamhiring.common.BusinessException;
import com.dreamhiring.common.PageVO;
import com.dreamhiring.common.ResultCode;
import com.dreamhiring.dto.CompanyRequests.JobStatusRequest;
import com.dreamhiring.dto.CompanyRequests.JobUpsertRequest;
import com.dreamhiring.dto.CompanyRequests.UpdateProfileRequest;
import com.dreamhiring.entity.ApplicationRecord;
import com.dreamhiring.entity.CompanyEntity;
import com.dreamhiring.entity.DomainEnums.ApplicationStatus;
import com.dreamhiring.entity.DomainEnums.AuditStatus;
import com.dreamhiring.entity.DomainEnums.JobStatus;
import com.dreamhiring.entity.JobEntity;
import com.dreamhiring.mapper.ApplicationMapper;
import com.dreamhiring.mapper.CompanyMapper;
import com.dreamhiring.mapper.JobCategoryMapper;
import com.dreamhiring.mapper.JobMapper;
import com.dreamhiring.security.SecurityPrincipal;
import com.dreamhiring.service.ApplicationService;
import com.dreamhiring.service.CompanyService;
import com.dreamhiring.service.HotJobCacheService;
import com.dreamhiring.util.SkillTagUtils;
import com.dreamhiring.vo.ApplicationViews.ApplicationView;
import com.dreamhiring.vo.CompanyViews.CompanyJobView;
import com.dreamhiring.vo.CompanyViews.CompanyView;
import com.dreamhiring.vo.CompanyViews.DashboardView;
import com.dreamhiring.vo.CompanyViews.Funnel;
import com.dreamhiring.vo.JobViews.CompanyBrief;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CompanyServiceImpl implements CompanyService {

    private final CompanyMapper companyMapper;
    private final JobMapper jobMapper;
    private final JobCategoryMapper categoryMapper;
    private final ApplicationMapper applicationMapper;
    private final ApplicationService applicationService;
    private final HotJobCacheService hotJobCacheService;

    public CompanyServiceImpl(
            CompanyMapper companyMapper,
            JobMapper jobMapper,
            JobCategoryMapper categoryMapper,
            ApplicationMapper applicationMapper,
            ApplicationService applicationService,
            HotJobCacheService hotJobCacheService
    ) {
        this.companyMapper = companyMapper;
        this.jobMapper = jobMapper;
        this.categoryMapper = categoryMapper;
        this.applicationMapper = applicationMapper;
        this.applicationService = applicationService;
        this.hotJobCacheService = hotJobCacheService;
    }

    @Override
    public CompanyView getProfile() {
        return toView(requireCompany());
    }

    @Override
    @Transactional
    public CompanyView updateProfile(UpdateProfileRequest request) {
        CompanyEntity company = requireCompany();
        company.setName(request.name());
        company.setIndustry(request.industry());
        company.setScale(request.scale());
        company.setCity(request.city());
        company.setLogoUrl(request.logoUrl());
        company.setIntro(request.intro());
        company.setContactName(request.contactName());
        company.setContactPhone(request.contactPhone());
        company.setContactEmail(request.contactEmail());
        company.setUpdateTime(LocalDateTime.now());
        companyMapper.update(company);
        hotJobCacheService.evict();
        return toView(company);
    }

    @Override
    public PageVO<CompanyJobView> listJobs(String status, String auditStatus, String keyword, int page, int size) {
        CompanyEntity company = requireCompany();
        int safePage = Math.max(1, page);
        int safeSize = Math.max(1, Math.min(size, 100));
        List<JobEntity> jobs = jobMapper.findByCompanyId(company.getId());
        List<JobEntity> filtered = jobs.stream()
                .filter(job -> status == null || status.isBlank() || job.getStatus().name().equals(status))
                .filter(job -> auditStatus == null || auditStatus.isBlank() || job.getAuditStatus().name().equals(auditStatus))
                .filter(job -> keyword == null || keyword.isBlank() || job.getTitle().contains(keyword))
                .toList();
        int from = Math.min((safePage - 1) * safeSize, filtered.size());
        int to = Math.min(from + safeSize, filtered.size());
        List<CompanyJobView> records = filtered.subList(from, to).stream().map(this::toJobView).toList();
        return PageVO.of(records, filtered.size(), safePage, safeSize);
    }

    @Override
    @Transactional
    public CompanyJobView createJob(JobUpsertRequest request) {
        CompanyEntity company = requireCompany();
        requireCategory(request.categoryId());
        validateSalaryRange(request.salaryMin(), request.salaryMax());
        LocalDateTime now = LocalDateTime.now();
        JobEntity job = JobEntity.builder()
                .companyId(company.getId())
                .categoryId(request.categoryId())
                .title(request.title())
                .city(request.city())
                .district(request.district())
                .salaryMin(request.salaryMin())
                .salaryMax(request.salaryMax())
                .education(request.education())
                .experience(request.experience())
                .description(request.description())
                .duties(SkillTagUtils.join(request.duties()))
                .requirements(SkillTagUtils.join(request.requirements()))
                .skillTags(SkillTagUtils.join(request.skillTags()))
                .perks(SkillTagUtils.join(request.perks()))
                .status(JobStatus.DRAFT)
                .auditStatus(AuditStatus.PENDING)
                .viewCount(0)
                .createTime(now)
                .updateTime(now)
                .deleted(0)
                .build();
        jobMapper.insert(job);
        hotJobCacheService.evict();
        return toJobView(job);
    }

    @Override
    public CompanyJobView jobDetail(Long jobId) {
        return toJobView(findOwnedJob(jobId));
    }

    @Override
    @Transactional
    public CompanyJobView updateJob(Long jobId, JobUpsertRequest request) {
        CompanyEntity company = requireCompany();
        JobEntity job = findOwnedJob(jobId);
        requireCategory(request.categoryId());
        validateSalaryRange(request.salaryMin(), request.salaryMax());
        job.setCategoryId(request.categoryId());
        job.setTitle(request.title());
        job.setCity(request.city());
        job.setDistrict(request.district());
        job.setSalaryMin(request.salaryMin());
        job.setSalaryMax(request.salaryMax());
        job.setEducation(request.education());
        job.setExperience(request.experience());
        job.setDescription(request.description());
        job.setDuties(SkillTagUtils.join(request.duties()));
        job.setRequirements(SkillTagUtils.join(request.requirements()));
        job.setSkillTags(SkillTagUtils.join(request.skillTags()));
        job.setPerks(SkillTagUtils.join(request.perks()));
        job.setAuditStatus(AuditStatus.PENDING);
        job.setAuditReason(null);
        job.setUpdateTime(LocalDateTime.now());
        jobMapper.update(job);
        hotJobCacheService.evict();
        return toJobView(job);
    }

    @Override
    @Transactional
    public void deleteJob(Long jobId) {
        findOwnedJob(jobId);
        CompanyEntity company = requireCompany();
        jobMapper.logicalDelete(jobId, company.getId(), LocalDateTime.now());
        hotJobCacheService.evict();
    }

    @Override
    @Transactional
    public CompanyJobView updateJobStatus(Long jobId, JobStatusRequest request) {
        JobEntity job = findOwnedJob(jobId);
        if (request.status() == JobStatus.PUBLISHED && job.getAuditStatus() != AuditStatus.APPROVED) {
            throw new BusinessException(ResultCode.CONFLICT, "职位审核通过后才能上架");
        }
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime publishTime = request.status() == JobStatus.PUBLISHED
                ? job.getPublishTime() == null ? now : job.getPublishTime()
                : job.getPublishTime();
        jobMapper.updateStatus(jobId, request.status().name(), publishTime, now);
        job.setStatus(request.status());
        job.setPublishTime(publishTime);
        job.setUpdateTime(now);
        hotJobCacheService.evict();
        return toJobView(job);
    }

    @Override
    public DashboardView dashboard() {
        CompanyEntity company = requireCompany();
        List<JobEntity> jobs = jobMapper.findByCompanyId(company.getId());
        List<ApplicationRecord> applications = applicationMapper.findByCompanyId(company.getId(), null, null, null);
        int activeJobs = (int) jobs.stream().filter(job -> job.getStatus() == JobStatus.PUBLISHED).count();
        int pending = (int) applications.stream().filter(a -> a.getStatus() == ApplicationStatus.PENDING_VIEW).count();
        int interviews = (int) applications.stream().filter(a -> a.getStatus() == ApplicationStatus.INTERVIEW).count();
        double average = applications.stream().mapToInt(ApplicationRecord::getMatchScore).average().orElse(0);
        List<ApplicationView> recentApplications = applicationService
                .companyList(null, null, null, 1, 5)
                .getRecords()
                .stream()
                .map(detail -> new ApplicationView(
                        detail.id(),
                        detail.resumeId(),
                        detail.jobId(),
                        detail.userId(),
                        detail.status(),
                        detail.matchScore(),
                        detail.companyRemark(),
                        detail.deliveryTime(),
                        detail.handleTime(),
                        detail.job()
                ))
                .toList();
        return new DashboardView(
                activeJobs,
                pending,
                interviews,
                Math.round(average * 10) / 10.0,
                new Funnel(
                        jobs.stream().mapToInt(JobEntity::getViewCount).sum(),
                        applications.size(),
                        interviews,
                        0
                ),
                recentApplications
        );
    }

    private CompanyEntity requireCompany() {
        SecurityPrincipal principal = AuthServiceImpl.requirePrincipal();
        CompanyEntity company = companyMapper.findByUserId(principal.id());
        if (company == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "企业资料不存在");
        }
        return company;
    }

    private JobEntity findOwnedJob(Long jobId) {
        CompanyEntity company = requireCompany();
        JobEntity job = jobMapper.findById(jobId);
        if (job == null || !job.getCompanyId().equals(company.getId())) {
            throw new BusinessException(ResultCode.NOT_FOUND, "职位不存在或已删除");
        }
        return job;
    }

    private void validateSalaryRange(Integer min, Integer max) {
        if (min > max) {
            throw new BusinessException(ResultCode.UNPROCESSABLE_ENTITY, "最低薪资不能大于最高薪资");
        }
    }

    private void requireCategory(Long categoryId) {
        if (categoryMapper.findById(categoryId) == null) {
            throw new BusinessException(ResultCode.UNPROCESSABLE_ENTITY, "职位分类不存在");
        }
        if (categoryMapper.countChildren(categoryId) > 0) {
            throw new BusinessException(ResultCode.UNPROCESSABLE_ENTITY, "请选择具体的二级职位分类");
        }
    }

    private CompanyView toView(CompanyEntity company) {
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
                company.getLogoUrl(),
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
        List<ApplicationRecord> applications = applicationMapper.findByCompanyId(
                job.getCompanyId(), job.getId(), null, null);
        CompanyEntity company = companyMapper.findById(job.getCompanyId());
        int pendingApplicantCount = (int) applications.stream()
                .filter(application -> application.getStatus() == ApplicationStatus.PENDING_VIEW)
                .count();
        return new CompanyJobView(
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
                company.getLogoUrl(),
                company.getAuditStatus()
        );
    }
}
