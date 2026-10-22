package com.dreamhiring.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RateLimitServiceTest {

    @Test
    void memoryFallbackShouldRejectRequestsAboveLimit() {
        @SuppressWarnings("unchecked")
        ObjectProvider<StringRedisTemplate> provider = mock(ObjectProvider.class);
        when(provider.getIfAvailable()).thenReturn(null);
        RateLimitService service = new RateLimitService(provider);

        assertThat(service.acquire("login:127.0.0.1", 2, Duration.ofMinutes(1)).allowed()).isTrue();
        assertThat(service.acquire("login:127.0.0.1", 2, Duration.ofMinutes(1)).allowed()).isTrue();
        RateLimitService.RateLimitDecision denied =
                service.acquire("login:127.0.0.1", 2, Duration.ofMinutes(1));

        assertThat(denied.allowed()).isFalse();
        assertThat(denied.remaining()).isZero();
        assertThat(service.acquire("login:127.0.0.2", 2, Duration.ofMinutes(1)).allowed()).isTrue();
    }
}
