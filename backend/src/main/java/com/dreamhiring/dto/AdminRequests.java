package com.dreamhiring.dto;

import com.dreamhiring.entity.DomainEnums.AnnouncementChannel;
import com.dreamhiring.entity.DomainEnums.AnnouncementStatus;
import com.dreamhiring.entity.DomainEnums.AuditStatus;
import com.dreamhiring.entity.DomainEnums.UserStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public final class AdminRequests {

    private AdminRequests() {
    }

    public record UserStatusRequest(
            @NotNull(message = "用户状态不能为空") UserStatus status
    ) {
    }

    public record AuditRequest(
            @NotNull(message = "审核状态不能为空") AuditStatus auditStatus,
            @Size(max = 255, message = "审核原因不能超过 255 个字符") String reason
    ) {
    }

    public record CategoryUpsertRequest(
            @NotBlank(message = "分类名称不能为空")
            @Size(max = 50, message = "分类名称不能超过 50 个字符")
            String name,
            Long parentId,
            @NotNull(message = "排序不能为空") Integer sort
    ) {
    }

    public record AnnouncementUpsertRequest(
            @NotBlank(message = "公告标题不能为空")
            @Size(max = 100, message = "公告标题不能超过 100 个字符")
            String title,
            @Size(max = 300, message = "公告摘要不能超过 300 个字符") String summary,
            @NotBlank(message = "公告内容不能为空")
            @Size(max = 20000, message = "公告内容不能超过 20000 个字符")
            String content,
            @NotNull(message = "触达范围不能为空") AnnouncementChannel channel,
            @NotNull(message = "公告状态不能为空") AnnouncementStatus status
    ) {
    }
}
