package com.dreamhiring.common;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class PageRequestTest {

    @Test
    void shouldNormalizePageAndSizeIntoContractRange() {
        assertThat(PageRequest.of(-1, 0)).isEqualTo(new PageRequest(1, 1));
        assertThat(PageRequest.of(2, 20)).isEqualTo(new PageRequest(2, 20));
        assertThat(PageRequest.of(3, 500)).isEqualTo(new PageRequest(3, 100));
    }
}
