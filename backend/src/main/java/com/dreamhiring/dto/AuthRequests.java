package com.dreamhiring.dto;

import com.dreamhiring.security.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public final class AuthRequests {

    private AuthRequests() {
    }

    public record RegisterRequest(
            @NotBlank(message = "用户名不能为空")
            @Size(min = 3, max = 50, message = "用户名长度必须为 3-50 个字符")
            String username,
            @NotBlank(message = "密码不能为空")
            @Size(min = 8, max = 64, message = "密码长度必须为 8-64 个字符")
            String password,
            @Size(min = 1, max = 50, message = "昵称长度必须为 1-50 个字符")
            String nickname,
            @Pattern(regexp = "^$|^[0-9+\\-]{6,20}$", message = "手机号格式不正确")
            String phone,
            @Email(message = "邮箱格式不正确")
            @Size(max = 100, message = "邮箱不能超过 100 个字符")
            String email,
            @NotNull(message = "用户角色不能为空")
            UserRole role,
            @NotBlank(message = "验证码 ID 不能为空")
            String captchaId,
            @NotBlank(message = "验证码不能为空")
            @Size(min = 4, max = 6, message = "验证码长度必须为 4-6 个字符")
            String captchaCode
    ) {
    }

    public record LoginRequest(
            @NotBlank(message = "用户名不能为空") String username,
            @NotBlank(message = "密码不能为空") String password,
            @NotBlank(message = "验证码 ID 不能为空") String captchaId,
            @NotBlank(message = "验证码不能为空")
            @Size(min = 4, max = 6, message = "验证码长度必须为 4-6 个字符")
            String captchaCode
    ) {
    }

    public record UpdateProfileRequest(
            @Size(min = 1, max = 50, message = "昵称长度必须为 1-50 个字符")
            String nickname,
            @Pattern(regexp = "^$|^[0-9+\\-]{6,20}$", message = "手机号格式不正确")
            String phone,
            @Email(message = "邮箱格式不正确")
            @Size(max = 100, message = "邮箱不能超过 100 个字符")
            String email,
            String avatarObjectKey
    ) {
    }

    public record ChangePasswordRequest(
            @NotBlank(message = "旧密码不能为空") String oldPassword,
            @NotBlank(message = "新密码不能为空")
            @Size(min = 8, max = 64, message = "新密码长度必须为 8-64 个字符")
            String newPassword
    ) {
    }
}
