package com.dreamhiring;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import javax.sql.DataSource;
import java.sql.Connection;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 使用本地 application-dev.yml 验证 MySQL 与实际表结构，不执行任何写入。
 */
@SpringBootTest(properties = {
        "app.seed-demo.enabled=false",
        "app.storage.mode=stub",
        "app.messaging.mode=local"
})
@ActiveProfiles("dev")
@EnabledIfEnvironmentVariable(named = "RUN_MYSQL_TESTS", matches = "true")
class MySqlSmokeTest {

    @Autowired
    private DataSource dataSource;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void databaseShouldBeMySqlAndContainRequiredTables() throws Exception {
        try (Connection connection = dataSource.getConnection()) {
            assertThat(connection.getMetaData().getDatabaseProductName()).containsIgnoringCase("MySQL");
        }

        Integer userCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM sys_user", Integer.class);
        Integer jobCount = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM job", Integer.class);
        Integer deadLetterCount = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM dead_letter_message",
                Integer.class
        );
        assertThat(userCount).isNotNull().isNotNegative();
        assertThat(jobCount).isNotNull().isNotNegative();
        assertThat(deadLetterCount).isNotNull().isNotNegative();
    }
}
