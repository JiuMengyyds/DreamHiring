package com.dreamhiring.common;

import java.io.Serializable;
import java.util.Objects;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Getter;

/**
 * 后端统一响应结构。
 *
 * <p>所有 Controller 必须通过本类返回，禁止直接返回实体或 Map。
 * code 采用 HTTP 语义：成功固定为 200，失败使用对应 4xx/5xx 状态码。
 *
 * @param <T> 业务数据类型
 */
@Getter
public class Result<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    private final int code;
    private final String msg;
    private final T data;

    private Result(ResultCode resultCode, String msg, T data) {
        Objects.requireNonNull(resultCode, "resultCode must not be null");
        this.code = resultCode.getCode();
        this.msg = msg == null || msg.isBlank() ? resultCode.getDefaultMessage() : msg;
        this.data = data;
    }

    public static <T> Result<T> success() {
        return new Result<>(ResultCode.SUCCESS, null, null);
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(ResultCode.SUCCESS, null, data);
    }

    public static <T> Result<T> failure(ResultCode resultCode) {
        return new Result<>(resultCode, null, null);
    }

    public static <T> Result<T> failure(ResultCode resultCode, String msg) {
        return new Result<>(resultCode, msg, null);
    }

    /**
     * 判断请求是否成功。
     *
     * @return code 为成功状态码时返回 true
     */
    @JsonIgnore
    public boolean isSuccess() {
        return code == ResultCode.SUCCESS.getCode();
    }
}
