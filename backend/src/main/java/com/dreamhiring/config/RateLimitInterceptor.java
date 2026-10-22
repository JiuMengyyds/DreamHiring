package com.dreamhiring.config;

import com.dreamhiring.common.Result;
import com.dreamhiring.common.ResultCode;
import com.dreamhiring.service.RateLimitService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.HandlerInterceptor;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimitProperties properties;
    private final RateLimitService rateLimitService;
    private final ObjectMapper objectMapper;

    public RateLimitInterceptor(
            RateLimitProperties properties,
            RateLimitService rateLimitService,
            ObjectMapper objectMapper
    ) {
        this.properties = properties;
        this.rateLimitService = rateLimitService;
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean preHandle(
            HttpServletRequest request,
            HttpServletResponse response,
            Object handler
    ) throws IOException {
        if (!properties.isEnabled() || !"POST".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        RateLimitRule rule = ruleFor(request.getRequestURI());
        if (rule == null) {
            return true;
        }
        String client = request.getRemoteAddr();
        RateLimitService.RateLimitDecision decision = rateLimitService.acquire(
                rule.name() + ":" + client,
                rule.limit(),
                Duration.ofSeconds(properties.getWindowSeconds())
        );
        response.setHeader("X-RateLimit-Limit", String.valueOf(rule.limit()));
        response.setHeader("X-RateLimit-Remaining", String.valueOf(decision.remaining()));
        if (decision.allowed()) {
            return true;
        }

        response.setStatus(ResultCode.TOO_MANY_REQUESTS.getCode());
        response.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(decision.retryAfterSeconds()));
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(
                response.getWriter(),
                Result.failure(
                        ResultCode.TOO_MANY_REQUESTS,
                        "请求过于频繁，请 " + decision.retryAfterSeconds() + " 秒后再试"
                )
        );
        return false;
    }

    private RateLimitRule ruleFor(String uri) {
        return switch (uri) {
            case "/api/auth/captcha" -> new RateLimitRule("auth-captcha", properties.getCaptchaLimit());
            case "/api/auth/login" -> new RateLimitRule("auth-login", properties.getLoginLimit());
            case "/api/auth/register" -> new RateLimitRule("auth-register", properties.getRegisterLimit());
            default -> null;
        };
    }

    private record RateLimitRule(String name, int limit) {
    }
}
