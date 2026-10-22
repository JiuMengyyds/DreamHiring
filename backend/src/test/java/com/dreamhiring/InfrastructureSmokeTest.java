package com.dreamhiring;

import com.dreamhiring.entity.DomainEnums.ApplicationStatus;
import com.dreamhiring.entity.DomainEnums.AnnouncementChannel;
import com.dreamhiring.entity.JobEntity;
import com.dreamhiring.messaging.ApplicationStatusChangedEvent;
import com.dreamhiring.messaging.AnnouncementPublishedEvent;
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
        jdbcTemplate.update("DELETE FROM message WHERE dedup_key LIKE ?", "ANNOUNCEMENT:8888:%");
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

    @Test
    void rabbitAnnouncementConsumerShouldNotifyTargetRole() {
        rabbitTemplate.convertAndSend(
                RabbitNotificationConfig.EXCHANGE,
                RabbitNotificationConfig.ANNOUNCEMENT_ROUTING_KEY,
                new AnnouncementPublishedEvent(
                        8888L,
                        "基础设施公告",
                        "公告消息链路已验证",
                        AnnouncementChannel.SEEKER
                )
        );

        Integer count = awaitCount(
                "SELECT COUNT(*) FROM message WHERE dedup_key LIKE 'ANNOUNCEMENT:8888:%'",
                1
        );
        assertThat(count).isEqualTo(1);
    }

    private Integer awaitMessageCount() {
        return awaitCount(
                "SELECT COUNT(*) FROM message WHERE dedup_key = 'APPLICATION:9999'",
                1
        );
    }

    private Integer awaitCount(String sql, int expectedMinimum) {
        Instant deadline = Instant.now().plus(Duration.ofSeconds(15));
        Integer count = 0;
        while (Instant.now().isBefore(deadline)) {
            count = jdbcTemplate.queryForObject(sql, Integer.class);
            if (count != null && count >= expectedMinimum) {
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
