package com.dreamhiring.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Configuration;
import com.dreamhiring.service.RateLimitService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableConfigurationProperties(RateLimitProperties.class)
@ConditionalOnBean(RateLimitService.class)
public class RateLimitConfig implements WebMvcConfigurer {

    private final RateLimitInterceptor rateLimitInterceptor;

    public RateLimitConfig(
            RateLimitProperties properties,
            RateLimitService rateLimitService,
            ObjectMapper objectMapper
    ) {
        this.rateLimitInterceptor = new RateLimitInterceptor(
                properties,
                rateLimitService,
                objectMapper
        );
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(rateLimitInterceptor)
                .addPathPatterns("/api/auth/captcha", "/api/auth/login", "/api/auth/register");
    }
}
