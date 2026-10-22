package com.dreamhiring.common;

/**
 * 统一分页请求参数。
 *
 * <p>页码从 1 开始，页大小限制在 1-100。越界值自动收敛，保证所有列表接口行为一致。
 */
public record PageRequest(int page, int size) {

    public static final int DEFAULT_PAGE = 1;
    public static final int DEFAULT_SIZE = 10;
    public static final int MAX_SIZE = 100;

    public PageRequest {
        page = Math.max(DEFAULT_PAGE, page);
        size = Math.min(MAX_SIZE, Math.max(1, size));
    }

    public static PageRequest of(int page, int size) {
        return new PageRequest(page, size);
    }
}
