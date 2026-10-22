package com.dreamhiring.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RateLimitService {

    private static final Logger log = LoggerFactory.getLogger(RateLimitService.class);

    private final ObjectProvider<StringRedisTemplate> redisProvider;
    private final ConcurrentHashMap<String, LocalCounter> localCounters = new ConcurrentHashMap<>();

    public RateLimitService(ObjectProvider<StringRedisTemplate> redisProvider) {
        this.redisProvider = redisProvider;
    }

    public RateLimitDecision acquire(String key, int limit, Duration window) {
        if (limit <= 0) {
            return RateLimitDecision.denied(window.toSeconds(), 0);
        }
        StringRedisTemplate redis = redisProvider.getIfAvailable();
        if (redis != null) {
            try {
                return acquireRedis(redis, key, limit, window);
            } catch (RuntimeException exception) {
                log.warn("Redis rate limit failed, falling back to memory", exception);
            }
        }
        return acquireLocal(key, limit, window);
    }

    private RateLimitDecision acquireRedis(
            StringRedisTemplate redis,
            String key,
            int limit,
            Duration window
    ) {
        String redisKey = "rate:" + key;
        Long count = redis.opsForValue().increment(redisKey);
        if (count == null) {
            return RateLimitDecision.denied(window.toSeconds(), 0);
        }
        if (count == 1) {
            redis.expire(redisKey, window);
        }
        Long ttl = redis.getExpire(redisKey);
        if (ttl == null || ttl < 0) {
            redis.expire(redisKey, window);
            ttl = window.toSeconds();
        }
        return count <= limit
                ? RateLimitDecision.allowed(ttl, (int) Math.max(0, limit - count))
                : RateLimitDecision.denied(ttl, 0);
    }

    private RateLimitDecision acquireLocal(String key, int limit, Duration window) {
        Instant now = Instant.now();
        LocalCounter counter = localCounters.compute(key, (ignored, current) -> {
            if (current == null || !current.expiresAt().isAfter(now)) {
                return new LocalCounter(1, now.plus(window));
            }
            return new LocalCounter(current.count() + 1, current.expiresAt());
        });
        long retryAfter = Math.max(1, Duration.between(now, counter.expiresAt()).toSeconds());
        return counter.count() <= limit
                ? RateLimitDecision.allowed(retryAfter, Math.max(0, limit - counter.count()))
                : RateLimitDecision.denied(retryAfter, 0);
    }

    private record LocalCounter(int count, Instant expiresAt) {
    }

    public record RateLimitDecision(boolean allowed, long retryAfterSeconds, int remaining) {

        public static RateLimitDecision allowed(long retryAfterSeconds, int remaining) {
            return new RateLimitDecision(true, retryAfterSeconds, remaining);
        }

        public static RateLimitDecision denied(long retryAfterSeconds, int remaining) {
            return new RateLimitDecision(false, retryAfterSeconds, remaining);
        }
    }
}
