package com.dreamhiring.security;

public record SecurityPrincipal(
        Long id,
        String username,
        String nickname,
        UserRole role
) {
}
