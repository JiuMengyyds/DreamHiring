package com.dreamhiring.security;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UserRoleTest {

    @Test
    void shouldExposeContractRolesAndAuthorities() {
        assertThat(UserRole.values())
                .extracting(UserRole::name)
                .containsExactly("SEEKER", "COMPANY", "ADMIN");
        assertThat(UserRole.SEEKER.getAuthority()).isEqualTo("ROLE_SEEKER");
        assertThat(UserRole.COMPANY.getAuthority()).isEqualTo("ROLE_COMPANY");
        assertThat(UserRole.ADMIN.getAuthority()).isEqualTo("ROLE_ADMIN");
    }

    @Test
    void shouldParseRoleIgnoringCaseAndWhitespace() {
        assertThat(UserRole.fromCode(" seeker ")).isEqualTo(UserRole.SEEKER);
        assertThat(UserRole.fromCode("Company")).isEqualTo(UserRole.COMPANY);
        assertThat(UserRole.fromCode("ADMIN")).isEqualTo(UserRole.ADMIN);
    }

    @Test
    void shouldRejectUnsupportedRole() {
        assertThatThrownBy(() -> UserRole.fromCode("GUEST"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("unsupported user role: GUEST");
    }
}
