package com.dreamhiring;

import com.dreamhiring.entity.DomainEnums.ApplicationStatus;
import com.dreamhiring.entity.DomainEnums.AnnouncementChannel;
import com.dreamhiring.entity.JobEntity;
import com.dreamhiring.messaging.ApplicationStatusChangedEvent;
import com.dreamhiring.messaging.AnnouncementPublishedEvent;
import com.dreamhiring.messaging.RabbitNotificationConfig;
import com.dreamhiring.service.CaptchaService;
import com.dreamhiring.service.DeadLetterService;
import com.dreamhiring.service.HotJobCacheService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

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
    private AmqpAdmin amqpAdmin;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private StringRedisTemplate redisTemplate;

    @Autowired
    private CaptchaService captchaService;

    @Autowired
    private HotJobCacheService hotJobCacheService;

    @Autowired
    private DeadLetterService deadLetterService;

    @Autowired
    private ObjectMapper objectMapper;

    @AfterEach
    void cleanInfrastructureData() {
        jdbcTemplate.update("DELETE FROM message WHERE dedup_key = ?", "APPLICATION:9999");
        jdbcTemplate.update("DELETE FROM message WHERE dedup_key = ?", "APPLICATION:9998");
        jdbcTemplate.update("DELETE FROM message WHERE dedup_key LIKE ?", "ANNOUNCEMENT:8888:%");
        jdbcTemplate.update("DELETE FROM dead_letter_message WHERE message_id LIKE ?", "infra-replay-%");
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

    @Test
    void archivedDeadLetterShouldReplayToOriginalQueue() throws Exception {
        String messageId = "infra-replay-" + System.nanoTime();
        String body = objectMapper.writeValueAsString(new ApplicationStatusChangedEvent(
                9998L,
                1L,
                "死信重投职位",
                ApplicationStatus.VIEWED
        ));
        jdbcTemplate.update(
                """
                INSERT INTO dead_letter_message (
                    queue_name, exchange_name, routing_key, message_id, correlation_id,
                    message_body, content_type, headers_json, failure_reason, status,
                    replay_count, create_time, update_time
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """,
                RabbitNotificationConfig.QUEUE,
                RabbitNotificationConfig.EXCHANGE,
                RabbitNotificationConfig.ROUTING_KEY,
                messageId,
                "infra-correlation",
                body,
                "application/json",
                "{}",
                "Infrastructure replay verification"
        );
        Long deadLetterId = jdbcTemplate.queryForObject(
                "SELECT id FROM dead_letter_message WHERE message_id = ?",
                Long.class,
                messageId
        );

        String verificationQueueName = "dreamhiring.infra.replay." + UUID.randomUUID();
        Queue verificationQueue = new Queue(verificationQueueName, false, false, true);
        amqpAdmin.declareQueue(verificationQueue);
        amqpAdmin.declareBinding(BindingBuilder.bind(verificationQueue)
                .to(new org.springframework.amqp.core.DirectExchange(RabbitNotificationConfig.EXCHANGE, true, false))
                .with(RabbitNotificationConfig.ROUTING_KEY));
        try {
            var replayed = deadLetterService.replay(deadLetterId);

            assertThat(replayed.status().name()).isEqualTo("REPLAYED");
            Object payload = awaitReplayPayload(verificationQueueName);
            assertThat(payload).isInstanceOf(Map.class);
            Map<?, ?> event = (Map<?, ?>) payload;
            assertThat(event.get("receiverId")).isEqualTo(9998);
            assertThat(event.get("jobTitle")).isEqualTo("死信重投职位");
            assertThat(jdbcTemplate.queryForObject(
                    "SELECT status FROM dead_letter_message WHERE id = ?",
                    String.class,
                    deadLetterId
            )).isEqualTo("REPLAYED");
        } finally {
            amqpAdmin.deleteQueue(verificationQueueName);
        }
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

    private Object awaitReplayPayload(String queueName) {
        Instant deadline = Instant.now().plus(Duration.ofSeconds(15));
        while (Instant.now().isBefore(deadline)) {
            Object payload = rabbitTemplate.receiveAndConvert(queueName);
            if (payload != null) {
                return payload;
            }
            try {
                Thread.sleep(200);
            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
                break;
            }
        }
        return null;
    }
}
