package com.dreamhiring.common;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ResultTest {

    @Test
    void successShouldKeepDataAndUseCode200() {
        Result<String> result = Result.success("ok");

        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getCode()).isEqualTo(200);
        assertThat(result.getMsg()).isEqualTo("success");
        assertThat(result.getData()).isEqualTo("ok");
    }

    @Test
    void successWithoutDataShouldReturnNullData() {
        Result<Void> result = Result.success();

        assertThat(result.getCode()).isEqualTo(200);
        assertThat(result.getData()).isNull();
    }

    @Test
    void failureShouldKeepErrorCodeAndMessage() {
        Result<Void> result = Result.failure(409, "你已经投递过该职位");

        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getCode()).isEqualTo(409);
        assertThat(result.getMsg()).isEqualTo("你已经投递过该职位");
        assertThat(result.getData()).isNull();
    }
}
