package com.dreamhiring.config;

import com.dreamhiring.entity.CompanyEntity;
import com.dreamhiring.entity.DomainEnums.AuditStatus;
import com.dreamhiring.entity.DomainEnums.CompanyAuditStatus;
import com.dreamhiring.entity.DomainEnums.EducationLevel;
import com.dreamhiring.entity.DomainEnums.ExperienceLevel;
import com.dreamhiring.entity.DomainEnums.JobStatus;
import com.dreamhiring.entity.DomainEnums.UserStatus;
import com.dreamhiring.entity.JobCategory;
import com.dreamhiring.entity.JobEntity;
import com.dreamhiring.entity.ResumeEntity;
import com.dreamhiring.entity.UserAccount;
import com.dreamhiring.mapper.CompanyMapper;
import com.dreamhiring.mapper.JobCategoryMapper;
import com.dreamhiring.mapper.JobMapper;
import com.dreamhiring.mapper.ResumeMapper;
import com.dreamhiring.mapper.UserMapper;
import com.dreamhiring.security.UserRole;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Component
@ConditionalOnProperty(prefix = "app.seed-demo", name = "enabled", havingValue = "true")
public class DemoDataInitializer implements ApplicationRunner {

    private final UserMapper userMapper;
    private final CompanyMapper companyMapper;
    private final JobCategoryMapper categoryMapper;
    private final JobMapper jobMapper;
    private final ResumeMapper resumeMapper;
    private final PasswordEncoder passwordEncoder;

    public DemoDataInitializer(
            UserMapper userMapper,
            CompanyMapper companyMapper,
            JobCategoryMapper categoryMapper,
            JobMapper jobMapper,
            ResumeMapper resumeMapper,
            PasswordEncoder passwordEncoder
    ) {
        this.userMapper = userMapper;
        this.companyMapper = companyMapper;
        this.categoryMapper = categoryMapper;
        this.jobMapper = jobMapper;
        this.resumeMapper = resumeMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userMapper.findByUsername("linzhixia") != null) {
            return;
        }
        LocalDateTime now = LocalDateTime.now();
        UserAccount seeker = createUser("linzhixia", "林知夏", UserRole.SEEKER, now);
        UserAccount companyUser = createUser("chenyu_hr", "陈屿", UserRole.COMPANY, now);
        createUser("admin_zhou", "周宁", UserRole.ADMIN, now);

        CompanyEntity company = CompanyEntity.builder()
                .userId(companyUser.getId())
                .name("星云科技")
                .industry("企业服务")
                .scale("500-999人")
                .city("杭州")
                .intro("专注企业协同与数字化办公。")
                .auditStatus(CompanyAuditStatus.APPROVED)
                .createTime(now)
                .updateTime(now)
                .deleted(0)
                .build();
        companyMapper.insert(company);

        JobCategory category = JobCategory.builder().name("产品 / 设计").sort(10).deleted(0).build();
        categoryMapper.insert(category);

        JobEntity job = JobEntity.builder()
                .companyId(company.getId())
                .categoryId(category.getId())
                .title("高级产品设计师")
                .city("杭州")
                .district("滨江区")
                .salaryMin(25)
                .salaryMax(38)
                .education(EducationLevel.BACHELOR)
                .experience(ExperienceLevel.THREE_TO_FIVE)
                .description("负责企业协同产品体验设计，参与完整产品设计链路。")
                .skillTags("Figma,B端产品,设计系统,用户研究")
                .status(JobStatus.PUBLISHED)
                .auditStatus(AuditStatus.APPROVED)
                .viewCount(0)
                .createTime(now)
                .updateTime(now)
                .deleted(0)
                .build();
        jobMapper.insert(job);

        resumeMapper.insert(ResumeEntity.builder()
                .userId(seeker.getId())
                .name("林知夏")
                .title("产品设计师")
                .education(EducationLevel.BACHELOR)
                .experienceYears(4)
                .currentCity("杭州")
                .expectCity("杭州 / 上海")
                .expectSalaryMin(25)
                .expectSalaryMax(35)
                .skillTags("Figma,B端产品,设计系统,用户研究")
                .summary("4 年 B 端产品体验设计经验。")
                .isDefault(1)
                .createTime(now)
                .updateTime(now)
                .deleted(0)
                .build());
    }

    private UserAccount createUser(String username, String nickname, UserRole role, LocalDateTime now) {
        UserAccount user = UserAccount.builder()
                .username(username)
                .passwordHash(passwordEncoder.encode("dreamhiring"))
                .nickname(nickname)
                .role(role)
                .status(UserStatus.ACTIVE)
                .createTime(now)
                .updateTime(now)
                .deleted(0)
                .build();
        userMapper.insert(user);
        return user;
    }
}
