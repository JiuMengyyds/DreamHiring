package com.dreamhiring.service;

import com.dreamhiring.entity.JobEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Set;

/**
 * 热门职位 ZSET 缓存。Redis 不可用时静默回源，避免缓存故障影响主流程。
 */
@Service
public class HotJobCacheService {

    public static final String HOT_JOB_KEY = "job:hot:list";
    private static final Duration TTL = Duration.ofMinutes(10);

    private static final Logger log = LoggerFactory.getLogger(HotJobCacheService.class);

    private final ObjectProvider<StringRedisTemplate> redisProvider;

    public HotJobCacheService(ObjectProvider<StringRedisTemplate> redisProvider) {
        this.redisProvider = redisProvider;
    }

    public List<Long> readHotJobIds(int limit) {
        StringRedisTemplate redis = redisProvider.getIfAvailable();
        if (redis == null) {
            return List.of();
        }
        try {
            Set<String> values = redis.opsForZSet().reverseRange(HOT_JOB_KEY, 0, limit - 1L);
            if (values == null) {
                return List.of();
            }
            return values.stream().map(Long::valueOf).toList();
        } catch (RuntimeException exception) {
            log.warn("Failed to read hot job cache", exception);
            return List.of();
        }
    }

    public void writeHotJobs(List<JobEntity> jobs) {
        StringRedisTemplate redis = redisProvider.getIfAvailable();
        if (redis == null || jobs.isEmpty()) {
            return;
        }
        try {
            redis.delete(HOT_JOB_KEY);
            jobs.forEach(job -> redis.opsForZSet().add(
                    HOT_JOB_KEY,
                    job.getId().toString(),
                    job.getViewCount() == null ? 0 : job.getViewCount()
            ));
            redis.expire(HOT_JOB_KEY, TTL);
        } catch (RuntimeException exception) {
            log.warn("Failed to refresh hot job cache", exception);
        }
    }

    public void evict() {
        StringRedisTemplate redis = redisProvider.getIfAvailable();
        if (redis == null) {
            return;
        }
        try {
            redis.delete(HOT_JOB_KEY);
        } catch (RuntimeException exception) {
            log.warn("Failed to evict hot job cache", exception);
        }
    }
}
