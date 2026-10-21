package com.dreamhiring.service.impl;

import com.dreamhiring.common.BusinessException;
import com.dreamhiring.common.ResultCode;
import com.dreamhiring.dto.AuthRequests.ChangePasswordRequest;
import com.dreamhiring.dto.AuthRequests.UpdateProfileRequest;
import com.dreamhiring.entity.UserAccount;
import com.dreamhiring.mapper.UserMapper;
import com.dreamhiring.security.SecurityPrincipal;
import com.dreamhiring.service.UserService;
import com.dreamhiring.vo.AuthViews.UserProfileView;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserProfileView getCurrentUser() {
        return AuthServiceImpl.toProfile(requireCurrentUser());
    }

    @Override
    @Transactional
    public UserProfileView updateCurrentUser(UpdateProfileRequest request) {
        UserAccount user = requireCurrentUser();
        if (request.nickname() != null) {
            user.setNickname(request.nickname());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone());
        }
        if (request.email() != null) {
            user.setEmail(request.email());
        }
        if (request.avatarUrl() != null) {
            user.setAvatarUrl(request.avatarUrl());
        }
        user.setUpdateTime(LocalDateTime.now());
        userMapper.updateProfile(user);
        return AuthServiceImpl.toProfile(user);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        UserAccount user = requireCurrentUser();
        if (!passwordEncoder.matches(request.oldPassword(), user.getPasswordHash())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "旧密码不正确");
        }
        if (request.oldPassword().equals(request.newPassword())) {
            throw new BusinessException(ResultCode.UNPROCESSABLE_ENTITY, "新密码不能与旧密码相同");
        }
        userMapper.updatePassword(
                user.getId(),
                passwordEncoder.encode(request.newPassword()),
                LocalDateTime.now()
        );
    }

    private UserAccount requireCurrentUser() {
        SecurityPrincipal principal = AuthServiceImpl.requirePrincipal();
        UserAccount user = userMapper.findById(principal.id());
        if (user == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }
        return user;
    }
}
