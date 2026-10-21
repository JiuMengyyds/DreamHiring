package com.dreamhiring.common;

import java.io.Serializable;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 统一分页响应结构。
 *
 * <p>字段契约与接口文档保持一致：records、total、page、size。
 * page 从 1 开始，size 为当前实际页大小。
 *
 * @param <T> 分页记录类型
 */
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PageVO<T> implements Serializable {

    private static final long serialVersionUID = 1L;

    private List<T> records;
    private long total;
    private int page;
    private int size;

    public static <T> PageVO<T> of(List<T> records, long total, int page, int size) {
        return new PageVO<>(records, total, page, size);
    }
}
