package com.dreamhiring.vo;

import com.dreamhiring.entity.DomainEnums.UserStatus;
import com.dreamhiring.security.UserRole;

import java.time.LocalDateTime;

public final class AuthViews {

    private AuthViews() {
    }

    public record UserView(
            Long id,
            String username,
            String nickname,
            UserRole role,
            UserStatus status,
            String phone,
            String email,
            String avatarUrl
    ) {
    }

    public record UserProfileView(
            Long id,
            String username,
            String nickname,
            UserRole role,
            UserStatus status,
            String phone,
            String email,
            String avatarUrl,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            LocalDateTime lastLoginAt
    ) {
    }

    public record AuthView(
            String accessToken,
            String tokenType,
            long expiresIn,
            UserView user
    ) {
    }

    public record CaptchaView(
            String captchaId,
            String imageBase64,
            long expiresIn
    ) {
    }
}
