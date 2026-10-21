package com.dreamhiring.common;

import java.util.Objects;

import lombok.Getter;

/**
 * 可预期的业务异常。
 *
 * <p>业务异常携带标准响应码，由全局异常处理器统一转换为 Result。
 * 对外消息可由具体业务覆盖；不应将数据库异常或内部技术细节直接作为消息抛出。
 */
@Getter
public class BusinessException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    private final ResultCode resultCode;

    public BusinessException(ResultCode resultCode) {
        super(Objects.requireNonNull(resultCode, "resultCode must not be null").getDefaultMessage());
        this.resultCode = resultCode;
    }

    public BusinessException(ResultCode resultCode, String message) {
        super(resolveMessage(resultCode, message));
        this.resultCode = resultCode;
    }

    private static String resolveMessage(ResultCode resultCode, String message) {
        Objects.requireNonNull(resultCode, "resultCode must not be null");
        return message == null || message.isBlank() ? resultCode.getDefaultMessage() : message;
    }
}
