package com.dreamhiring.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.rate-limit")
public class RateLimitProperties {

    private boolean enabled = true;
    private int windowSeconds = 60;
    private int captchaLimit = 30;
    private int loginLimit = 10;
    private int registerLimit = 5;
}
