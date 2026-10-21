package com.dreamhiring.common;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class BusinessExceptionTest {

    @Test
    void shouldUseResultCodeDefaultMessage() {
        BusinessException exception = new BusinessException(ResultCode.NOT_FOUND);

        assertThat(exception.getResultCode()).isEqualTo(ResultCode.NOT_FOUND);
        assertThat(exception).hasMessage(ResultCode.NOT_FOUND.getDefaultMessage());
    }

    @Test
    void shouldAllowBusinessMessageOverride() {
        BusinessException exception = new BusinessException(ResultCode.CONFLICT, "职位当前不可投递");

        assertThat(exception.getResultCode()).isEqualTo(ResultCode.CONFLICT);
        assertThat(exception).hasMessage("职位当前不可投递");
    }

    @Test
    void shouldRejectNullResultCode() {
        assertThatThrownBy(() -> new BusinessException(null))
                .isInstanceOf(NullPointerException.class)
                .hasMessage("resultCode must not be null");
    }
}
