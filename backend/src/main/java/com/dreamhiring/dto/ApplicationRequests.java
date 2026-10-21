package com.dreamhiring.dto;

import com.dreamhiring.entity.DomainEnums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class ApplicationRequests {

    private ApplicationRequests() {
    }

    public record CreateRequest(
            @NotNull(message = "职位 ID 不能为空") Long jobId,
            @NotNull(message = "简历 ID 不能为空") Long resumeId
    ) {
    }

    public record StatusRequest(
            @NotNull(message = "投递状态不能为空") ApplicationStatus status,
            @Size(max = 255, message = "备注不能超过 255 个字符") String remark
    ) {
    }

    public record RemarkRequest(
            @Size(max = 255, message = "备注不能超过 255 个字符") String remark
    ) {
    }
}
