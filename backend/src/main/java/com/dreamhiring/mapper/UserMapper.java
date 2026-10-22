package com.dreamhiring.mapper;

import com.dreamhiring.entity.UserAccount;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserMapper {

    UserAccount findById(@Param("id") Long id);

    UserAccount findByUsername(@Param("username") String username);

    List<UserAccount> findAll(@Param("keyword") String keyword,
                              @Param("role") String role,
                              @Param("status") String status);

    List<Long> findActiveIdsByRoles(@Param("roles") List<String> roles);

    int insert(UserAccount user);

    int updateProfile(UserAccount user);

    int updatePassword(@Param("id") Long id,
                       @Param("passwordHash") String passwordHash,
                       @Param("updateTime") java.time.LocalDateTime updateTime);

    int updateLastLogin(@Param("id") Long id,
                        @Param("lastLoginTime") java.time.LocalDateTime lastLoginTime);

    int updateStatus(@Param("id") Long id,
                     @Param("status") String status,
                     @Param("updateTime") java.time.LocalDateTime updateTime);

    int logicalDelete(@Param("id") Long id,
                      @Param("updateTime") java.time.LocalDateTime updateTime);
}
