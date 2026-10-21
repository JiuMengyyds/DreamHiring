package com.dreamhiring.controller;

import com.dreamhiring.common.Result;
import com.dreamhiring.dto.AuthRequests.LoginRequest;
import com.dreamhiring.dto.AuthRequests.RegisterRequest;
import com.dreamhiring.service.AuthService;
import com.dreamhiring.service.CaptchaService;
import com.dreamhiring.vo.AuthViews.AuthView;
import com.dreamhiring.vo.AuthViews.CaptchaView;
import com.dreamhiring.vo.AuthViews.UserProfileView;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final CaptchaService captchaService;

    public AuthController(AuthService authService, CaptchaService captchaService) {
        this.authService = authService;
        this.captchaService = captchaService;
    }

    @PostMapping("/captcha")
    public Result<CaptchaView> captcha() {
        return Result.success(captchaService.generate());
    }

    @PostMapping("/register")
    public Result<AuthView> register(@Valid @RequestBody RegisterRequest request) {
        return Result.success(authService.register(request));
    }

    @PostMapping("/login")
    public Result<AuthView> login(@Valid @RequestBody LoginRequest request) {
        return Result.success(authService.login(request));
    }

    @PostMapping("/logout")
    public Result<Void> logout() {
        return Result.success();
    }

    @GetMapping("/me")
    public Result<UserProfileView> me() {
        return Result.success(authService.currentUser());
    }
}
