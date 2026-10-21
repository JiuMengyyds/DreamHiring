package com.dreamhiring.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ResultTest {

    @Test
    void successShouldKeepDataAndUseCode200() {
        Result<String> result = Result.success("ok");

        assertThat(result.isSuccess()).isTrue();
        assertThat(result.getCode()).isEqualTo(ResultCode.SUCCESS.getCode());
        assertThat(result.getMsg()).isEqualTo(ResultCode.SUCCESS.getDefaultMessage());
        assertThat(result.getData()).isEqualTo("ok");
    }

    @Test
    void successWithoutDataShouldReturnNullData() {
        Result<Void> result = Result.success();

        assertThat(result.getCode()).isEqualTo(ResultCode.SUCCESS.getCode());
        assertThat(result.getData()).isNull();
    }

    @Test
    void failureShouldUseDefaultMessageWhenCustomMessageIsAbsent() {
        Result<Void> result = Result.failure(ResultCode.NOT_FOUND);

        assertThat(result.isSuccess()).isFalse();
        assertThat(result.getCode()).isEqualTo(ResultCode.NOT_FOUND.getCode());
        assertThat(result.getMsg()).isEqualTo(ResultCode.NOT_FOUND.getDefaultMessage());
        assertThat(result.getData()).isNull();
    }

    @Test
    void failureShouldAllowBusinessMessageToOverrideDefaultMessage() {
        Result<Void> result = Result.failure(ResultCode.CONFLICT, "你已经投递过该职位");

        assertThat(result.getCode()).isEqualTo(ResultCode.CONFLICT.getCode());
        assertThat(result.getMsg()).isEqualTo("你已经投递过该职位");
        assertThat(result.getData()).isNull();
    }

    @Test
    void resultCodesShouldMatchTheApiContract() {
        assertThat(ResultCode.SUCCESS.getCode()).isEqualTo(200);
        assertThat(ResultCode.BAD_REQUEST.getCode()).isEqualTo(400);
        assertThat(ResultCode.UNAUTHORIZED.getCode()).isEqualTo(401);
        assertThat(ResultCode.FORBIDDEN.getCode()).isEqualTo(403);
        assertThat(ResultCode.NOT_FOUND.getCode()).isEqualTo(404);
        assertThat(ResultCode.CONFLICT.getCode()).isEqualTo(409);
        assertThat(ResultCode.PAYLOAD_TOO_LARGE.getCode()).isEqualTo(413);
        assertThat(ResultCode.UNPROCESSABLE_ENTITY.getCode()).isEqualTo(422);
        assertThat(ResultCode.TOO_MANY_REQUESTS.getCode()).isEqualTo(429);
        assertThat(ResultCode.INTERNAL_SERVER_ERROR.getCode()).isEqualTo(500);
    }

    @Test
    void isSuccessShouldNotLeakIntoJson() throws Exception {
        String json = new ObjectMapper().writeValueAsString(Result.success("ok"));

        assertThat(json).contains("\"code\":200", "\"msg\"", "\"data\":\"ok\"");
        assertThat(new ObjectMapper().readTree(json).has("success")).isFalse();
    }
}
