package com.dreamhiring.security;

import java.util.Arrays;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 平台用户角色。
 *
 * <p>枚举名作为 API 返回值和 JWT 角色值，authority 用于 Spring Security。
 */
@Getter
@RequiredArgsConstructor
public enum UserRole {

    SEEKER("求职者", "ROLE_SEEKER"),
    COMPANY("企业 HR", "ROLE_COMPANY"),
    ADMIN("平台管理员", "ROLE_ADMIN");

    private final String displayName;
    private final String authority;

    /**
     * 根据 API 或 JWT 中的角色值解析枚举。
     *
     * @param code 角色值，忽略大小写
     * @return 对应角色
     * @throws IllegalArgumentException 当角色值不受支持时
     */
    public static UserRole fromCode(String code) {
        if (code == null) {
            throw new IllegalArgumentException("user role must not be null");
        }
        return Arrays.stream(values())
                .filter(role -> role.name().equalsIgnoreCase(code.trim()))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("unsupported user role: " + code));
    }
}
