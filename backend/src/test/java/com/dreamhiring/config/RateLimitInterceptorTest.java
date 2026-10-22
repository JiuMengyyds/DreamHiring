package com.dreamhiring.config;

import com.dreamhiring.service.RateLimitService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class RateLimitInterceptorTest {

    @Test
    void rejectedRequestShouldReturn429AndRetryAfter() throws Exception {
        RateLimitProperties properties = new RateLimitProperties();
        properties.setLoginLimit(2);
        RateLimitService service = mock(RateLimitService.class);
        when(service.acquire(anyString(), anyInt(), any()))
                .thenReturn(RateLimitService.RateLimitDecision.denied(42, 0));
        ObjectMapper objectMapper = new ObjectMapper();
        RateLimitInterceptor interceptor = new RateLimitInterceptor(properties, service, objectMapper);
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/auth/login");
        request.setRemoteAddr("127.0.0.1");
        MockHttpServletResponse response = new MockHttpServletResponse();

        boolean allowed = interceptor.preHandle(request, response, new Object());

        assertThat(allowed).isFalse();
        assertThat(response.getStatus()).isEqualTo(429);
        assertThat(response.getHeader("Retry-After")).isEqualTo("42");
        JsonNode body = objectMapper.readTree(response.getContentAsString());
        assertThat(body.path("code").asInt()).isEqualTo(429);
    }
}
