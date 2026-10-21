package com.dreamhiring.common;

import java.util.List;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PageVOTest {

    @Test
    void shouldKeepPaginationFieldsAndRecords() {
        List<String> records = List.of("job-1", "job-2");

        PageVO<String> page = PageVO.of(records, 20L, 2, 10);

        assertThat(page.getRecords()).containsExactly("job-1", "job-2");
        assertThat(page.getTotal()).isEqualTo(20L);
        assertThat(page.getPage()).isEqualTo(2);
        assertThat(page.getSize()).isEqualTo(10);
    }

    @Test
    void shouldSupportEmptyResult() {
        PageVO<String> page = PageVO.of(List.of(), 0L, 1, 10);

        assertThat(page.getRecords()).isEmpty();
        assertThat(page.getTotal()).isZero();
    }
}
