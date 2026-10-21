package com.dreamhiring.service.impl;

import com.dreamhiring.common.BusinessException;
import com.dreamhiring.common.ResultCode;
import com.dreamhiring.dto.AuthRequests.LoginRequest;
import com.dreamhiring.dto.AuthRequests.RegisterRequest;
import com.dreamhiring.entity.DomainEnums.UserStatus;
import com.dreamhiring.entity.CompanyEntity;
import com.dreamhiring.entity.DomainEnums.CompanyAuditStatus;
import com.dreamhiring.entity.UserAccount;
import com.dreamhiring.mapper.CompanyMapper;
import com.dreamhiring.mapper.UserMapper;
import com.dreamhiring.security.JwtService;
import com.dreamhiring.security.SecurityPrincipal;
import com.dreamhiring.security.UserRole;
import com.dreamhiring.service.AuthService;
import com.dreamhiring.service.CaptchaService;
import com.dreamhiring.vo.AuthViews.AuthView;
import com.dreamhiring.vo.AuthViews.UserProfileView;
import com.dreamhiring.vo.AuthViews.UserView;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final CaptchaService captchaService;
    private final JwtService jwtService;
    private final CompanyMapper companyMapper;

    public AuthServiceImpl(
            UserMapper userMapper,
            PasswordEncoder passwordEncoder,
            CaptchaService captchaService,
            JwtService jwtService,
            CompanyMapper companyMapper
    ) {
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
        this.captchaService = captchaService;
        this.jwtService = jwtService;
        this.companyMapper = companyMapper;
    }

    @Override
    @Transactional
    public AuthView register(RegisterRequest request) {
        if (request.role() == UserRole.ADMIN) {
            throw new BusinessException(ResultCode.FORBIDDEN, "管理员账号不开放自助注册");
        }
        validateCaptcha(request.captchaId(), request.captchaCode());
        if (userMapper.findByUsername(request.username()) != null) {
            throw new BusinessException(ResultCode.CONFLICT, "用户名已存在");
        }

        LocalDateTime now = LocalDateTime.now();
        UserAccount user = UserAccount.builder()
                .username(request.username())
                .passwordHash(passwordEncoder.encode(request.password()))
                .nickname(request.nickname() == null || request.nickname().isBlank()
                        ? request.username() : request.nickname())
                .role(request.role())
                .status(UserStatus.ACTIVE)
                .phone(request.phone())
                .email(request.email())
                .createTime(now)
                .updateTime(now)
                .deleted(0)
                .build();
        userMapper.insert(user);
        if (user.getRole() == UserRole.COMPANY) {
            companyMapper.insert(CompanyEntity.builder()
                    .userId(user.getId())
                    .name(user.getNickname() + "的企业")
                    .industry("待完善")
                    .city("待完善")
                    .intro("企业资料待完善")
                    .auditStatus(CompanyAuditStatus.PENDING)
                    .createTime(now)
                    .updateTime(now)
                    .deleted(0)
                    .build());
        }
        return issueToken(user);
    }

    @Override
    @Transactional
    public AuthView login(LoginRequest request) {
        validateCaptcha(request.captchaId(), request.captchaCode());
        UserAccount user = userMapper.findByUsername(request.username());
        if (user == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "账号或密码错误");
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new BusinessException(ResultCode.FORBIDDEN, "账号已被禁用");
        }
        LocalDateTime now = LocalDateTime.now();
        userMapper.updateLastLogin(user.getId(), now);
        user.setLastLoginTime(now);
        return issueToken(user);
    }

    @Override
    public UserProfileView currentUser() {
        return toProfile(requireCurrentUser());
    }

    public static SecurityPrincipal requirePrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof SecurityPrincipal principal)) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }
        return principal;
    }

    private void validateCaptcha(String captchaId, String captchaCode) {
        if (!captchaService.validateAndConsume(captchaId, captchaCode)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "验证码无效或已过期");
        }
    }

    private AuthView issueToken(UserAccount user) {
        SecurityPrincipal principal = new SecurityPrincipal(
                user.getId(),
                user.getUsername(),
                user.getNickname(),
                user.getRole()
        );
        return new AuthView(
                jwtService.createToken(principal),
                "Bearer",
                jwtService.getExpirationSeconds(),
                toView(user)
        );
    }

    private UserAccount requireCurrentUser() {
        SecurityPrincipal principal = requirePrincipal();
        UserAccount user = userMapper.findById(principal.id());
        if (user == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED);
        }
        return user;
    }

    static UserView toView(UserAccount user) {
        return new UserView(
                user.getId(),
                user.getUsername(),
                user.getNickname(),
                user.getRole(),
                user.getStatus(),
                user.getPhone(),
                user.getEmail(),
                user.getAvatarUrl()
        );
    }

    static UserProfileView toProfile(UserAccount user) {
        return new UserProfileView(
                user.getId(),
                user.getUsername(),
                user.getNickname(),
                user.getRole(),
                user.getStatus(),
                user.getPhone(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getCreateTime(),
                user.getUpdateTime(),
                user.getLastLoginTime()
        );
    }
}
