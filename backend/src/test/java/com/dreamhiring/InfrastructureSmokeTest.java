package com.dreamhiring;

import com.dreamhiring.entity.DomainEnums.ApplicationStatus;
import com.dreamhiring.entity.JobEntity;
import com.dreamhiring.messaging.ApplicationStatusChangedEvent;
import com.dreamhiring.messaging.RabbitNotificationConfig;
import com.dreamhiring.service.CaptchaService;
import com.dreamhiring.service.HotJobCacheService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 需要本机 Redis、RabbitMQ 已启动，使用 RUN_INFRA_TESTS=true 显式执行。
 */
@SpringBootTest
@ActiveProfiles("infra")
@EnabledIfEnvironmentVariable(named = "RUN_INFRA_TESTS", matches = "true")
class InfrastructureSmokeTest {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private CaptchaService captchaService;

    @Autowired
    private HotJobCacheService hotJobCacheService;

    @AfterEach
    void cleanInfrastructureData() {
        jdbcTemplate.update("DELETE FROM message WHERE dedup_key = ?", "APPLICATION:9999");
        redisTemplate.delete(HotJobCacheService.HOT_JOB_KEY);
    }

    @Test
    void redisCaptchaAndHotJobCacheShouldWork() {
        String captchaId = captchaService.generate().captchaId();

        assertThat(redisTemplate.hasKey("captcha:" + captchaId)).isTrue();
        assertThat(redisTemplate.getExpire("captcha:" + captchaId)).isPositive();

        hotJobCacheService.writeHotJobs(List.of(JobEntity.builder().id(1L).viewCount(25).build()));
        assertThat(hotJobCacheService.readHotJobIds(1)).containsExactly(1L);
    }

    @Test
    void rabbitPublisherAndManualAckConsumerShouldPersistMessage() {
        rabbitTemplate.convertAndSend(
                RabbitNotificationConfig.EXCHANGE,
                RabbitNotificationConfig.ROUTING_KEY,
                new ApplicationStatusChangedEvent(1L, 9999L, "基础设施冒烟职位", ApplicationStatus.INTERVIEW)
        );

        Integer count = awaitMessageCount();
        assertThat(count).isEqualTo(1);
    }

    private Integer awaitMessageCount() {
        Instant deadline = Instant.now().plus(Duration.ofSeconds(15));
        Integer count = 0;
        while (Instant.now().isBefore(deadline)) {
            count = jdbcTemplate.queryForObject(
                    "SELECT COUNT(*) FROM message WHERE dedup_key = ?",
                    Integer.class,
                    "APPLICATION:9999"
            );
            if (count != null && count > 0) {
                return count;
            }
            try {
                Thread.sleep(200);
            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        return count;
    }
}
