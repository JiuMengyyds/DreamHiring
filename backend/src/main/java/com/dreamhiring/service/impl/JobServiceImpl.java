package com.dreamhiring.service.impl;

import com.dreamhiring.common.BusinessException;
import com.dreamhiring.common.PageRequest;
import com.dreamhiring.common.PageVO;
import com.dreamhiring.common.ResultCode;
import com.dreamhiring.dto.JobQuery;
import com.dreamhiring.entity.CompanyEntity;
import com.dreamhiring.entity.JobCategory;
import com.dreamhiring.entity.JobEntity;
import com.dreamhiring.entity.ResumeEntity;
import com.dreamhiring.mapper.CompanyMapper;
import com.dreamhiring.mapper.JobCategoryMapper;
import com.dreamhiring.mapper.JobMapper;
import com.dreamhiring.mapper.ResumeMapper;
import com.dreamhiring.security.SecurityPrincipal;
import com.dreamhiring.security.UserRole;
import com.dreamhiring.service.FileService;
import com.dreamhiring.service.HotJobCacheService;
import com.dreamhiring.service.JobService;
import com.dreamhiring.util.SkillTagUtils;
import com.dreamhiring.vo.JobViews.CategoryNode;
import com.dreamhiring.vo.JobViews.CompanyBrief;
import com.dreamhiring.vo.JobViews.JobDetail;
import com.dreamhiring.vo.JobViews.JobSummary;
import com.dreamhiring.vo.JobViews.MatchExplanation;
import com.github.pagehelper.Page;
import com.github.pagehelper.PageHelper;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class JobServiceImpl implements JobService {

    private final JobMapper jobMapper;
    private final CompanyMapper companyMapper;
    private final JobCategoryMapper categoryMapper;
    private final ResumeMapper resumeMapper;
    private final HotJobCacheService hotJobCacheService;
    private final FileService fileService;

    public JobServiceImpl(
            JobMapper jobMapper,
            CompanyMapper companyMapper,
            JobCategoryMapper categoryMapper,
            ResumeMapper resumeMapper,
            HotJobCacheService hotJobCacheService,
            FileService fileService
    ) {
        this.jobMapper = jobMapper;
        this.companyMapper = companyMapper;
        this.categoryMapper = categoryMapper;
        this.resumeMapper = resumeMapper;
        this.hotJobCacheService = hotJobCacheService;
        this.fileService = fileService;
    }

    @Override
    public PageVO<JobSummary> search(JobQuery query, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        PageHelper.startPage(pageRequest.page(), pageRequest.size());
        Page<JobEntity> jobs = (Page<JobEntity>) jobMapper.search(query);
        ResumeEntity resume = currentSeekerResume();
        Map<Long, CompanyEntity> companies = loadCompanies(jobs);
        List<JobSummary> records = jobs.stream()
                .map(job -> toSummary(job, companies.get(job.getCompanyId()), resume))
                .toList();
        return PageVO.of(records, jobs.getTotal(), pageRequest.page(), pageRequest.size());
    }

    @Override
    public List<JobSummary> hot(int limit) {
        ResumeEntity resume = currentSeekerResume();
        int normalizedLimit = Math.max(1, Math.min(limit, 50));
        List<JobEntity> jobs = loadCachedHotJobs(normalizedLimit);
        if (jobs.isEmpty()) {
            jobs = jobMapper.hot(normalizedLimit);
            hotJobCacheService.writeHotJobs(jobs);
        }
        Map<Long, CompanyEntity> companies = loadCompanies(jobs);
        return jobs.stream()
                .map(job -> toSummary(job, companies.get(job.getCompanyId()), resume))
                .toList();
    }

    @Override
    public JobDetail detail(Long jobId) {
        JobEntity job = jobMapper.findById(jobId);
        if (job == null
                || job.getStatus() != com.dreamhiring.entity.DomainEnums.JobStatus.PUBLISHED
                || job.getAuditStatus() != com.dreamhiring.entity.DomainEnums.AuditStatus.APPROVED) {
            throw new BusinessException(ResultCode.NOT_FOUND, "职位不存在或已删除");
        }
        jobMapper.incrementViewCount(jobId);
        CompanyEntity company = companyMapper.findById(job.getCompanyId());
        ResumeEntity resume = currentSeekerResume();
        MatchExplanation explanation = match(job, resume);
        return new JobDetail(
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
                job.getViewCount() + 1,
                explanation == null ? null : explanation.score(),
                explanation,
                job.getDescription(),
                SkillTagUtils.split(job.getDuties()),
                SkillTagUtils.split(job.getRequirements()),
                toCompanyBrief(company),
                job.getPublishTime(),
                job.getUpdateTime()
        );
    }

    @Override
    public List<CategoryNode> categoryTree() {
        List<JobCategory> categories = categoryMapper.findAll();
        Map<Long, List<JobCategory>> children = categories.stream()
                .filter(category -> category.getParentId() != null)
                .collect(Collectors.groupingBy(JobCategory::getParentId));
        return categories.stream()
                .filter(category -> category.getParentId() == null)
                .map(category -> new CategoryNode(
                        category.getId(),
                        category.getName(),
                        null,
                        category.getSort(),
                        jobMapper.countPublishedByCategoryId(category.getId()),
                        children.getOrDefault(category.getId(), List.of()).stream()
                                .map(child -> new CategoryNode(
                                        child.getId(),
                                        child.getName(),
                                        child.getParentId(),
                                        child.getSort(),
                                        jobMapper.countPublishedByCategoryId(child.getId()),
                                        List.of()))
                                .toList()
                ))
                .toList();
    }

    private Map<Long, CompanyEntity> loadCompanies(List<JobEntity> jobs) {
        return jobs.stream()
                .map(JobEntity::getCompanyId)
                .distinct()
                .map(companyMapper::findById)
                .filter(company -> company != null)
                .collect(Collectors.toMap(CompanyEntity::getId, company -> company));
    }

    private List<JobEntity> loadCachedHotJobs(int limit) {
        List<Long> ids = hotJobCacheService.readHotJobIds(limit);
        if (ids.isEmpty()) {
            return List.of();
        }
        Map<Long, Integer> positions = new java.util.HashMap<>();
        for (int index = 0; index < ids.size(); index++) {
            positions.put(ids.get(index), index);
        }
        return jobMapper.findPublishedByIds(ids).stream()
                .sorted(Comparator.comparingInt(job -> positions.getOrDefault(job.getId(), Integer.MAX_VALUE)))
                .toList();
    }

    private JobSummary toSummary(JobEntity job, CompanyEntity company, ResumeEntity resume) {
        MatchExplanation explanation = match(job, resume);
        return new JobSummary(
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
                explanation == null ? null : explanation.score(),
                job.getUpdateTime()
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

    private MatchExplanation match(JobEntity job, ResumeEntity resume) {
        if (resume == null) {
            return null;
        }
        List<String> jobSkills = SkillTagUtils.split(job.getSkillTags());
        List<String> resumeSkills = SkillTagUtils.split(resume.getSkillTags());
        List<String> matched = new ArrayList<>(jobSkills);
        matched.retainAll(resumeSkills);
        List<String> missing = new ArrayList<>(jobSkills);
        missing.removeAll(resumeSkills);
        int score = jobSkills.isEmpty() ? 0 : Math.round(matched.size() * 100f / jobSkills.size());
        return new MatchExplanation(score, matched, missing, matched.size(), jobSkills.size());
    }

    private ResumeEntity currentSeekerResume() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof SecurityPrincipal principal)) {
            return null;
        }
        return principal.role() == UserRole.SEEKER
                ? resumeMapper.findDefaultByUserId(principal.id())
                : null;
    }
}
