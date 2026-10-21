package com.dreamhiring.controller;

import com.dreamhiring.common.Result;
import com.dreamhiring.dto.AuthRequests.ChangePasswordRequest;
import com.dreamhiring.dto.AuthRequests.UpdateProfileRequest;
import com.dreamhiring.service.UserService;
import com.dreamhiring.vo.AuthViews.UserProfileView;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users/me")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public Result<UserProfileView> getCurrentUser() {
        return Result.success(userService.getCurrentUser());
    }

    @PutMapping
    public Result<UserProfileView> updateCurrentUser(@Valid @RequestBody UpdateProfileRequest request) {
        return Result.success(userService.updateCurrentUser(request));
    }

    @PutMapping("/password")
    public Result<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        userService.changePassword(request);
        return Result.success();
    }
}
