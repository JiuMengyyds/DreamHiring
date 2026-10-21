package com.dreamhiring.common;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * 统一响应状态码和默认消息。
 *
 * <p>业务代码和全局异常处理器必须通过这些枚举表达标准响应码，
 * 禁止直接书写 200、400、401 等魔法数字。
 */
@Getter
@RequiredArgsConstructor
public enum ResultCode {

    SUCCESS(200, "success"),
    BAD_REQUEST(400, "请求参数不合法"),
    UNAUTHORIZED(401, "请先登录或重新登录"),
    FORBIDDEN(403, "无权执行该操作"),
    NOT_FOUND(404, "资源不存在或已删除"),
    CONFLICT(409, "当前状态不允许执行该操作"),
    PAYLOAD_TOO_LARGE(413, "文件大小不能超过 10MB"),
    UNPROCESSABLE_ENTITY(422, "业务规则校验失败"),
    TOO_MANY_REQUESTS(429, "操作过于频繁，请稍后再试"),
    INTERNAL_SERVER_ERROR(500, "系统繁忙，请稍后重试");

    private final int code;
    private final String defaultMessage;
}
