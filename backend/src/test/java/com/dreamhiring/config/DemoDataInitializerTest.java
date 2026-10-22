package com.dreamhiring.config;

import com.dreamhiring.entity.JobCategory;
import com.dreamhiring.entity.JobEntity;
import com.dreamhiring.entity.UserAccount;
import com.dreamhiring.mapper.CompanyMapper;
import com.dreamhiring.mapper.JobCategoryMapper;
import com.dreamhiring.mapper.JobMapper;
import com.dreamhiring.mapper.ResumeMapper;
import com.dreamhiring.mapper.UserMapper;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DemoDataInitializerTest {

    @Test
    void shouldCreateTwoLevelCategoriesAndAssignLeafToDemoJob() throws Exception {
        UserMapper userMapper = mock(UserMapper.class);
        CompanyMapper companyMapper = mock(CompanyMapper.class);
        JobCategoryMapper categoryMapper = mock(JobCategoryMapper.class);
        JobMapper jobMapper = mock(JobMapper.class);
        ResumeMapper resumeMapper = mock(ResumeMapper.class);
        PasswordEncoder passwordEncoder = mock(PasswordEncoder.class);
        when(userMapper.findByUsername("linzhixia")).thenReturn(null);
        when(passwordEncoder.encode(any())).thenReturn("{noop}dreamhiring");

        AtomicLong userIds = new AtomicLong(10);
        doAnswer(invocation -> {
            UserAccount user = invocation.getArgument(0);
            user.setId(userIds.incrementAndGet());
            return 1;
        }).when(userMapper).insert(any(UserAccount.class));
        doAnswer(invocation -> {
            invocation.<com.dreamhiring.entity.CompanyEntity>getArgument(0).setId(20L);
            return 1;
        }).when(companyMapper).insert(any(com.dreamhiring.entity.CompanyEntity.class));

        List<JobCategory> categories = new ArrayList<>();
        doAnswer(invocation -> {
            JobCategory category = invocation.getArgument(0);
            category.setId((long) categories.size() + 1);
            categories.add(category);
            return 1;
        }).when(categoryMapper).insert(any(JobCategory.class));

        List<JobEntity> jobs = new ArrayList<>();
        doAnswer(invocation -> {
            jobs.add(invocation.getArgument(0));
            return 1;
        }).when(jobMapper).insert(any(JobEntity.class));

        DemoDataInitializer initializer = new DemoDataInitializer(
                userMapper,
                companyMapper,
                categoryMapper,
                jobMapper,
                resumeMapper,
                passwordEncoder
        );
        initializer.run(null);

        assertThat(categories).hasSize(2);
        assertThat(categories.get(0).getParentId()).isNull();
        assertThat(categories.get(1).getParentId()).isEqualTo(categories.get(0).getId());
        assertThat(jobs).hasSize(1);
        assertThat(jobs.getFirst().getCategoryId()).isEqualTo(categories.get(1).getId());
    }
}
