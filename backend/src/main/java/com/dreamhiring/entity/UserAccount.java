package com.dreamhiring.entity;

import com.dreamhiring.entity.DomainEnums.UserStatus;
import com.dreamhiring.security.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAccount {

    private Long id;
    private String username;
    private String passwordHash;
    private String nickname;
    private UserRole role;
    private UserStatus status;
    private String phone;
    private String email;
    private String avatarObjectKey;
    private LocalDateTime lastLoginTime;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
    private Integer deleted;
}
