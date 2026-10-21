package com.dreamhiring.common;

import java.io.Serializable;

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

    private Result(int code, String msg, T data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }

    public static <T> Result<T> success() {
        return new Result<>(200, "success", null);
    }

    public static <T> Result<T> success(T data) {
        return new Result<>(200, "success", data);
    }

    public static <T> Result<T> failure(int code, String msg) {
        return new Result<>(code, msg, null);
    }

    /**
     * 判断请求是否成功。
     *
     * @return code 为 200 时返回 true
     */
    public boolean isSuccess() {
        return code == 200;
    }
}
