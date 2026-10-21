package com.dreamhiring.service;

import com.dreamhiring.vo.AuthViews.CaptchaView;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CaptchaService {

    private static final Duration TTL = Duration.ofSeconds(120);
    private static final char[] ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".toCharArray();

    private final StringRedisTemplate redisTemplate;
    private final SecureRandom random = new SecureRandom();
    private final Map<String, CaptchaEntry> localStore = new ConcurrentHashMap<>();

    public CaptchaService(ObjectProvider<StringRedisTemplate> redisTemplateProvider) {
        this.redisTemplate = redisTemplateProvider.getIfAvailable();
    }

    public CaptchaView generate() {
        String captchaId = UUID.randomUUID().toString();
        String code = randomCode();
        if (redisTemplate != null) {
            redisTemplate.opsForValue().set(redisKey(captchaId), code, TTL);
        } else {
            localStore.put(captchaId, new CaptchaEntry(code, Instant.now().plus(TTL)));
        }

        String svg = """
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="44">
                  <rect width="100%%" height="100%%" fill="#eef2ff"/>
                  <path d="M4 30 L28 12 L58 31 L84 10 L116 28" stroke="#9aabdc" fill="none"/>
                  <text x="60" y="30" text-anchor="middle" font-size="22" font-family="monospace"
                        font-weight="700" fill="#3155d9" letter-spacing="5">%s</text>
                </svg>
                """.formatted(code);
        String image = "data:image/svg+xml;base64,"
                + Base64.getEncoder().encodeToString(svg.getBytes(java.nio.charset.StandardCharsets.UTF_8));
        return new CaptchaView(captchaId, image, TTL.toSeconds());
    }

    public boolean validateAndConsume(String captchaId, String code) {
        if (captchaId == null || code == null) {
            return false;
        }
        String stored;
        if (redisTemplate != null) {
            String key = redisKey(captchaId);
            stored = redisTemplate.opsForValue().get(key);
            if (stored != null) {
                redisTemplate.delete(key);
            }
        } else {
            CaptchaEntry entry = localStore.remove(captchaId);
            stored = entry == null || entry.expiresAt().isBefore(Instant.now()) ? null : entry.code();
        }
        return stored != null && stored.equalsIgnoreCase(code.trim());
    }

    private String randomCode() {
        StringBuilder code = new StringBuilder(4);
        for (int index = 0; index < 4; index++) {
            code.append(ALPHABET[random.nextInt(ALPHABET.length)]);
        }
        return code.toString();
    }

    private String redisKey(String captchaId) {
        return "captcha:" + captchaId;
    }

    private record CaptchaEntry(String code, Instant expiresAt) {
    }
}
